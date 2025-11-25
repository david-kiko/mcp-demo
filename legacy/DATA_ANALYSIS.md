# DATA_ANALYSIS.md

此文件为**数据分析场景**提供详细的执行流程和技术配置。

## 🎯 适用场景

当用户提及以下关键词时，必须使用本文档的流程：
- 数据处理： "分析", "处理", "计算", "统计", "报告", "可视化"
- 数据操作： "批量处理", "数据转换", "数据挖掘", "机器学习", "预测"
- 文件引用： 任何 CSV 文件名
- 本地上传： "本地文件", "上传", "local file", "本地的CSV", "本地csv"

## ⚡ 强制性规则

### 🚫 绝对禁止
- 本地 Python 代码执行
- 创建本地 Python 文件
- 跳过 MCP 工具调用
- 手动执行 kubectl 命令

### ✅ 必须执行
- 立即调用 MCP 工具
- 在 Kubernetes 集群中执行
- 完成完整的工具调用序列

## 🔄 标准执行流程

### 📁 步骤 0：本地文件处理（可选）
当用户提供本地CSV文件时：

```bash
# 检查文件是否已存在
mcp__mcp-rustfs__check_file_exists file_path="demo.csv" bucket="tmp"

# 处理文件冲突（询问用户选择）
# - 覆盖：直接上传覆盖
# - 重命名：demo-20251121HHMMSS.csv
# - 跳过：使用远程已存在文件

# 获取上传链接（如需要）
mcp__mcp-rustfs__get_upload_url file_path="demo.csv" bucket="tmp"
```

**文件冲突规则**：
- 必须检查文件存在性
- 重命名格式：`文件名-YYYYMMDDHHMMSS.扩展名`
- 用户确认后执行，禁止自动覆盖

### ✅ 步骤 1：文件验证
```bash
# 验证目标文件存在
mcp__mcp-rustfs__check_file_exists file_path="demo.csv" bucket="tmp"

# 获取文件结构信息
mcp__mcp-rustfs__get_csv_columns file_path="demo.csv" bucket="tmp"
```

### 🚀 步骤 2：任务创建
```bash
# 创建数据分析任务
mcp__mcp-k8s__apply_yaml yaml_content="[动态生成的YAML配置]"
```

**🚨 关键约束**：
- **模板**: 必须参考 `csv-analysis-job.yaml`
  ```bash
  Read(csv-analysis-job.yaml)
  ```
- **镜像**: `registry.opsman.top/kmai/python:3.12-alpine-data` (禁止修改)
- **动态**: 任务名称、资源限制、文件路径可调整

### 📊 步骤 3：执行监控
```bash
# 监控任务状态
mcp__mcp-k8s__get_pods namespace="default"

# 等待任务完成，检查执行状态
```

### 📋 步骤 4：结果获取
```bash
# 获取执行日志
mcp__mcp-k8s__kubectl command="logs job/任务名称 -n default"

# 检查输出文件和结果
```

## ⚙️ 核心配置

### 🐳 Docker 环境
- **镜像**: `registry.opsman.top/kmai/python:3.12-alpine-data` (禁止修改)
- **依赖**: boto3, pandas, numpy, chardet (已预装)
- **后果**: 其他镜像会导致拉取失败和依赖缺失

### 💾 存储配置
- **端点**: `http://192.168.248.41:9000`
- **数据桶**: `data` (已存在文件)
- **临时桶**: `tmp` (用户上传)
- **认证**: 环境变量 `RUSTFS_USER`/`RUSTFS_PASS`

### 📊 资源层级
| 级别 | CPU | 内存 |
|------|-----|------|
| 轻量 | 200m/1000m | 256Mi/512Mi |
| 中等 | 500m/2000m | 512Mi/2Gi |
| 重量 | 1000m/4000m | 1Gi/4Gi |

### ⏱️ 任务约束
- **超时**: 10分钟 (`activeDeadlineSeconds: 600`)
- **清理**: 5分钟 (`ttlSecondsAfterFinished: 300`)
- **重试**: 无 (`backoffLimit: 0`)

## 📈 报告生成

### 流程步骤
1. **加载模板**:
   ```bash
   Read(report-prompt.md)
   Read(report-generator-template.md)
   ```
2. **生成报告**: 输出到 `.reports/` 目录
3. **命名规范**: `{task-name}-{timestamp}-report.html`
4. **保存**: 使用 `Write` 工具

## 🚨 关键文件

### `csv-analysis-job.yaml`
- **用途**: 所有数据分析任务的唯一模板
- **镜像**: 必须使用指定镜像，禁止修改
- **功能**: ConfigMap + 任务定义 + 自动清理
- **注意**: 仅作模板参考，实际使用 `apply_yaml` 传入内容

## 🔧 故障排除

### 快速诊断
```bash
# 检查服务器状态
mcp__mcp-k8s__server_status

# 验证文件访问
mcp__mcp-rustfs__check_file_exists file_path="demo.csv" bucket="tmp"

# 列出可用资源
mcp__mcp-rustfs__list_buckets
mcp__mcp-rustfs__list_csv_files bucket="tmp"

# 监控任务
mcp__mcp-k8s__get_pods namespace="default"
```

### 常见问题解决
| 问题 | 解决方案 |
|------|----------|
| 镜像拉取失败 | 使用指定镜像，禁止其他镜像 |
| 文件访问错误 | 检查bucket名称和认证信息 |
| 任务超时 | 增加 `activeDeadlineSeconds` |
| 内存不足 | 调整资源限制或优化代码 |

## ✅ 执行检查清单

- [ ] 已加载 `DATA_ANALYSIS.md`
- [ ] 已验证文件存在性
- [ ] 已使用正确的bucket
- [ ] 已参考 `csv-analysis-job.yaml` 模板
- [ ] 已使用指定镜像
- [ ] 已监控任务执行
- [ ] 已获取执行结果
- [ ] 已生成分析报告（如需要）