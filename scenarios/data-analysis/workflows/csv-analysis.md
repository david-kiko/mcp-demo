# CSV文件分析工作流

**🎯 职责**：CSV数据分析的完整执行流程

## 🚨 执行规则

### 立即执行清单
1. 按步骤顺序执行，不跳过
2. 每步完成后进行验证
3. 失败时参考故障排除文档

### 绝对禁止
- **禁止**本地执行Python代码
- **禁止**跳过文件验证步骤
- **禁止**使用非指定镜像

---

## 🔄 执行步骤

### 步骤1：MCP服务状态检查（最高优先级）
**目的**：在执行任何操作前确认MCP服务可用性

**执行指令**：
```bash
# 必须首先执行的检查命令
claude mcp list
```

**判断逻辑**：
- ✅ **服务正常**：继续执行步骤2
- ✗ **连接失败**：立即停止，执行故障排除流程

**错误处理**：
```bash
# 如果MCP服务不可用，立即执行：
Read(shared/troubleshooting.md)  # 查找"MCP服务不可用"章节
# 显示标准化错误提示，停止所有后续操作
```

### 步骤2：文件验证与发现
**目的**：确认CSV文件存在并获取结构信息
**注意**：仅在MCP服务可用时执行此步骤

**执行指令**：
```bash
# 检查文件存在性（tmp bucket优先）
mcp__mcp-rustfs__check_file_exists file_path="{filename}" bucket="tmp"
# 如果不存在，检查data bucket
mcp__mcp-rustfs__check_file_exists file_path="{filename}" bucket="data"

# 获取文件列信息
mcp__mcp-rustfs__get_csv_columns file_path="{filename}" bucket="{确定存在的bucket}"
```

**🚨 异常处理规则**：

**工具级别错误（立即停止）**：
- **"No such tool available"** → 显示"工具配置错误"模板
- **权限配置错误** → 显示"工具配置错误"模板
- **工具名称不匹配** → 显示"工具配置错误"模板
- 禁止继续执行后续步骤
- 禁止尝试诊断或修复

**可重试错误（网络/临时问题）**：
- 网络超时、连接临时失败
- 服务暂时不可用
- 可以重试1-2次
- 如果多次重试失败，再考虑停止处理

**🚨 文件不存在处理流程**：
当CSV文件不在RustFS中时，需要从本地上传：

**执行指令**：
```bash
# 1. 获取上传链接（优先使用tmp bucket）
mcp__mcp-rustfs__get_upload_url file_path="{filename}" bucket="tmp"

# 2. 执行文件上传
curl -X PUT -H "Content-Type: text/csv" --data-binary "@{filename}" "{upload_url}"

# 3. 验证上传成功
mcp__mcp-rustfs__check_file_exists file_path="{filename}" bucket="tmp"

# 4. 获取文件列信息
mcp__mcp-rustfs__get_csv_columns file_path="{filename}" bucket="tmp"
```

**上传失败处理**：
- 如果上传失败，检查文件格式和权限
- 如果获取上传链接失败，参考故障排除文档
- 不尝试其他存储方案，严格按照MCP流程执行

**成功标准**：
- 文件存在性确认（RustFS中）
- 获取到列名和类型信息
- 上传流程完成（如需要）

### 步骤3：分析数据结构并配置参数
**目的**：基于CSV数据结构理解分析需求，准备YAML模板参数

**执行指令**：
```bash
# 1. 分析CSV列结构，确定数据处理策略
# 2. 理解YAML模板中Python代码的处理逻辑
# 3. 准备参数替换所需的键值对
# 4. 确认模板代码与新数据结构的兼容性
```

**重要理解**：
- ✅ Python分析代码已存在于YAML模板中
- ✅ 只需通过参数替换适配新的数据结构
- ❌ 禁止创建新的Python文件
- ❌ 禁止本地执行Python代码

**🚨 重要约束 - pandas版本兼容性**：
- **绝对禁止**：使用 `pd.np.number`、`pd.np.int64` 等已弃用语法
- **正确做法**：直接使用 `np.number`、`np.int64` 或 `isinstance(x, (int, float))`
- **必需导入**：如果使用numpy，必须 `import numpy as np`
- **版本安全**：避免使用pandas的已弃用功能，推荐使用原生Python类型判断

**示例代码**：
```python
# ❌ 错误 - 已弃用
isinstance(value, pd.np.number)

# ✅ 正确 - 推荐用法
import numpy as np
isinstance(value, (int, float, np.number))

# ✅ 最安全 - 纯Python
def safe_float_convert(value):
    if pd.isna(value) or value == '' or value is None:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0
```

### 步骤4：加载模板并创建任务
**目的**：基于现有YAML模板创建并执行Kubernetes任务

**执行指令**：
```bash
# 1. 加载现有的YAML模板到内存
template_content = Read(scenarios/data-analysis/templates/csv-analysis-job.yaml)

# 2. 在内存中进行参数替换（不创建临时文件）
final_yaml = template_content.replace("csv-analysis-job-1763533656", "csv-analysis-{filename}-{timestamp}")
final_yaml = final_yaml.replace('BUCKET_NAME", 'value": "{bucket}"')
final_yaml = final_yaml.replace('FILE_NAME', 'value": "{filename}"')
# ... 其他参数替换

# 3. 直接使用MCP工具应用配置（传入字符串，不是文件路径）
mcp__mcp-k8s__apply_yaml yaml_content=final_yaml
```

**关键执行原则**：
- ✅ **只读取，不写入**：YAML模板只通过Read()读取
- ✅ **内存处理**：所有替换操作在字符串变量中进行
- ✅ **无临时文件**：绝不使用Write()创建临时YAML文件
- ✅ **直接调用**：将最终YAML字符串直接传给MCP工具

### 步骤5：监控任务执行
**目的**：确保任务正常运行

**执行指令**：
```bash
# 监控Pod状态
mcp__mcp-k8s__get_pods namespace="default"

# 检查Pod详细状态
mcp__mcp-k8s__kubectl command="describe pod {pod-name} -n default"

# 等待任务完成，检查执行状态
```

**🚨 不可重试问题判断**：
**立即停止条件**（遇到以下错误不尝试替代方案）：
- **`error getting ClusterInformation: connection is unauthorized`** → 网络插件权限问题
- **`Forbidden`** → RBAC权限错误
- **`ImagePullBackOff`（非镜像地址错误）** → 镜像仓库访问权限问题
- **`PersistentVolumeClaim is bound`** → 存储配置问题
- **API Server连接失败** → 集群核心组件故障

**处理流程**：
1. **识别错误类型** → 分析错误信息判断是否为不可重试问题
2. **立即停止处理** → 不尝试本地分析或其他替代方案
3. **显示标准化错误** → 使用shared/troubleshooting.md中的K8s错误模板
4. **记录详细信息** → 保存Pod描述和事件日志供用户参考

### 步骤6：获取分析结果
**目的**：收集任务执行结果和日志

**执行指令**：
```bash
# 获取任务执行日志
mcp__mcp-k8s__kubectl command="logs job/{任务名称} -n default"
```

### 步骤7：生成分析报告（必需步骤）
**目的**：基于分析结果生成标准化的HTML报告

**执行指令**：
```bash
# 1. 读取报告生成提示词模板
Read(scenarios/data-analysis/templates/report-prompt.md)

# 2. 使用报告生成模板创建HTML报告
# 将分析结果与提示词结合，生成交互式HTML报告
# 保存到 .generated/reports/{YYYY-MM}/{filename}-{timestamp}-report.html
```

---

## 🔧 YAML模板参数替换

### 模板加载
- **模板文件**：`scenarios/data-analysis/templates/csv-analysis-job.yaml`
- **加载方式**：使用Read()工具读取完整YAML内容
- **处理方式**：在内存中进行字符串替换，不生成临时文件

### 必需替换参数

#### 🚨 注意：Kubernetes命名规范
**K8s资源名称必须符合RFC 1123 DNS子域名规范**：
- **只允许**：小写字母、数字、连字符(-)
- **必须**：以字母或数字开头和结尾
- **禁止**：大写字母、下划线(_)、点号(.)
- **长度限制**：最多63个字符

**示例**：
- `test_student_scores.csv` → `test-student-scores`
- `Sales Data.xlsx` → `sales-data`

```yaml
# 1. Job元数据
metadata:
  name: csv-analysis-{sanitized_filename}-{timestamp}  # 例如: csv-analysis-test-student-scores-20251124-094746

# 2. 环境变量
env:
- name: BUCKET_NAME
  value: "{bucket}"  # 从步骤1获取: tmp 或 data
- name: FILE_NAME
  value: "{filename}"  # 从步骤1获取的文件名

# 3. 任务ID
- name: TASK_ID
  value: "csv-analysis-{sanitized_filename}-{timestamp}"
```

### 可选替换参数
```yaml
# 根据数据量动态调整资源
resources:
  requests:
    cpu: "{cpu_request}"      # 默认: 200m
    memory: "{memory_request}" # 默认: 256Mi
  limits:
    cpu: "{cpu_limit}"        # 默认: 500m
    memory: "{memory_limit}"  # 默认: 512Mi

# 超时配置
activeDeadlineSeconds: {timeout_seconds}  # 默认: 600
```

### 资源配置建议
- **小文件(<10MB)**: CPU 200m/500m, 内存 256Mi/512Mi, 超时300s
- **中等文件(10-100MB)**: CPU 500m/1000m, 内存 512Mi/1Gi, 超时600s
- **大文件(>100MB)**: CPU 1000m/2000m, 内存 1Gi/2Gi, 超时1800s

### 执行流程
1. **读取模板** → 完整YAML字符串
2. **参数替换** → 字符串替换生成最终配置（注意文件名需符合K8s命名规范）
3. **直接调用** → `mcp__mcp-k8s__apply_yaml`应用配置
4. **无临时文件** → 全程在内存中处理

---

## 🚨 重要约束

- **禁止生成临时文件**：所有参数替换在内存中完成
- **禁止修改模板文件**：只能读取，不能写入
- **必须使用MCP工具**：最终配置通过`mcp__mcp-k8s__apply_yaml`应用
- **保持模板完整性**：替换时保持YAML结构不变
- **注意K8s命名规范**：资源名称需符合RFC 1123规范

---

## 🚨 故障排除

### 常见问题
1. **文件不存在** → 检查bucket和文件名
2. **编码错误** → 尝试不同编码方式
3. **任务失败** → 查看Kubernetes日志
4. **权限错误** → 检查RustFS访问权限
5. **K8s命名规范错误** → 资源名称包含大写字母或下划线，需要转换为小写和连字符

**解决方法**：
```bash
立即执行：Read(shared/troubleshooting.md)
```

---

## ✅ 完成标准

### MCP服务不可用时的完成标准
- [ ] MCP服务状态检查完成
- [ ] 显示标准化错误提示
- [ ] 停止所有后续处理流程

### 正常执行完成标准
- [ ] MCP服务状态检查通过
- [ ] 文件验证完成
- [ ] Python分析脚本生成（符合pandas兼容性要求）
- [ ] Kubernetes任务创建成功
- [ ] 任务执行完成
- [ ] 分析结果获取成功
- [ ] HTML报告生成完成（使用report-prompt.md模板）
- [ ] 用户收到完整的分析报告和文件路径

### 📋 标准输出格式

分析完成后，必须按以下格式输出：

```bash
echo "✅ 数据分析完成！"
echo "📊 分析文件：{filename}"
echo "📁 完整路径：$(pwd)/.generated/reports/{YYYY-MM}/{task-name}-{timestamp}-report.html"
echo "💡 使用方法：复制上述路径到浏览器地址栏中直接打开"
echo ""
echo "📋 分析摘要："
echo "   - 数据行数：{row_count}"
echo "   - 数据列数：{column_count}"
echo "   - 关键发现：{main_findings}"
echo ""
echo "🎯 报告特色：交互式图表、数据筛选、统计分析"
```

**重要说明**：
- 必须提供完整的绝对路径（从根目录开始）
- 路径格式：`/full/path/to/project/.generated/reports/YYYY-MM/filename.html`
- 用户可以直接复制路径到浏览器中打开
- 避免只提供文件名或相对路径

---

*本工作流确保CSV数据分析的标准化和可靠性。*