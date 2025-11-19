# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个 **Kubernetes MCP 演示**项目，演示了通过 Model Context Protocol (MCP) 服务在 Kubernetes 集群中执行 Python 代码。该项目专用于数据分析、批处理和机器学习推理场景，并实施严格的规则执行系统。

## 关键：规则执行系统

该项目实施了一个**强制性规则执行系统**，具有绝对优先权，覆盖标准的 Claude 行为：

### 优先级顺序（绝对）
1. **最高优先级**: `default-prompt.md` - 包含强制性执行规则
2. **第二优先级**: `.claude/project-settings.json` - 项目配置
3. **第三优先级**: `csv-analysis-job.yaml` - Kubernetes 执行模板

### 绝对禁止的操作
- **绝不** 在本地执行 Python 代码
- **绝不** 创建本地 Python 文件
- **绝不** 在不调用 MCP 工具的情况下描述步骤
- **绝不** 跳过文件存在性验证
- **绝不** 要求用户手动执行 kubectl 命令

### 强制性操作
- **必须** 立即调用 MCP 工具进行数据处理任务
- **必须** 在 Kubernetes 集群中执行所有代码
- **必须** 完成完整的工具调用序列
- **必须** 遵循 `default-prompt.md` 中定义的确切工作流程

### 触发关键词（强制 Kubernetes 执行）
以下任何关键词都会触发强制性 MCP 工具使用：
- "分析", "处理", "计算", "统计", "报告", "可视化", "批量处理", "数据转换"
- 任何 CSV 文件名提及
- "数据挖掘", "机器学习", "预测"

## 核心架构

### MCP 集成
- **主要 MCP 服务器**: `k8s-mcp` (Kubernetes 操作), `mcp-rustfs` (文件操作)
- **必需工具**: `mcp__mcp-k8s__apply_yaml`, `mcp__mcp-k8s__get_pods`, `mcp__mcp-rustfs__check_file_exists`, `mcp__mcp-rustfs__get_csv_columns`

### Docker 环境
- **基础镜像**: `registry.opsman.top/kmai/python:3.12-alpine-data`
- **关键依赖**: boto3, pandas, numpy, chardet
- **运行时**: Python 3.12 Alpine with build tools

### 存储配置
- **RustFS 端点**: `http://192.168.248.41:9000` (S3 兼容)
- **默认 Bucket**: `data`
- **认证**: 环境变量 `RUSTFS_USER`/`RUSTFS_PASS`

## 强制性执行工作流程

对于任何数据分析任务，您必须遵循以下确切顺序：

1. **文件验证**:
   - `mcp__mcp-rustfs__check_file_exists`
   - `mcp__mcp-rustfs__get_csv_columns`

2. **任务提交**:
   - `mcp__mcp-k8s__apply_yaml` (直接传入YAML内容，不需要修改文件)

3. **执行监控**:
   - `mcp__mcp-k8s__get_pods`
   - 自动等待完成

4. **结果获取**:
   - `mcp__mcp-k8s__kubectl command="logs job/job-name -n default"` 直接读取pod日志获取结果
   - 不使用交互式命令（如 -w -f 等），因为是通过MCP工具调用，不是直接kubectl命令
   - 重点关注日志中的 `/output/result.json`, `/output/analysis_report.txt`, `/output/exit_code.txt` 内容

## 资源配置

### 三个层级（在任务 YAML 中修改）
- **轻量级**: CPU 200m/1000m, 内存 256Mi/512Mi
- **中等级**: CPU 500m/2000m, 内存 512Mi/2Gi
- **重量级**: CPU 1000m/4000m, 内存 1Gi/4Gi

### 任务约束
- **超时**: 10分钟 (`activeDeadlineSeconds: 600`)
- **TTL 清理**: 5分钟 (`ttlSecondsAfterFinished: 300`)
- **重试**: 无 (`backoffLimit: 0`)

## 关键配置文件

### `csv-analysis-job.yaml`
- **ConfigMap**: 包含 Python 分析代码和 shell 脚本
- **任务模板**: 完整的 Kubernetes 任务定义
- **销售分析**: 为中文销售数据列预配置
- **自动清理**: 自动资源清理标签
- **注意**: 此文件仅作为模板，实际提交时使用 `mcp__mcp-k8s__apply_yaml` 传入动态修改后的内容

### 必需的环境变量
```yaml
env:
- name: TASK_ID
  value: "unique-task-id-with-timestamp"
- name: PYTHONUNBUFFERED
  value: "1"
- name: RUSTFS_ENDPOINT
  value: "http://192.168.248.41:9000"
- name: RUSTFS_USER
  value: "rustfsadmin"
- name: RUSTFS_PASS
  value: "rustfsadmin"
- name: BUCKET_NAME
  value: "data"
- name: FILE_NAME
  value: "input.csv"
```

## 报告生成

### HTML 报告生成流程
当需要输出报告时，必须按以下步骤执行：

1. **加载报告模板**:
   - 读取 `report-prompt.md` 获取企业级样式和设计规范
   - 读取 `report-generator-template.md` 了解报告生成调用模板

2. **报告生成**:
   - **输出目录**: `.reports/`
   - **命名规范**: `{task-name}-{timestamp}-report.html`
   - **功能特性**: 玻璃拟态设计, Chart.js 可视化, 响应式布局
   - **数据来源**: 从分析任务的 result.json 和日志中提取数据

3. **报告保存**:
   - 使用 `Write` 工具将HTML报告保存到 `.reports/` 目录
   - 确保报告文件符合命名规范和时间戳格式

## 故障排除命令

### MCP 工具调试
```bash
# 检查 MCP 服务器状态
mcp__mcp-k8s__server_status

# 验证文件访问
mcp__mcp-rustfs__check_file_exists file_path="test.csv" bucket="data"

# 监控任务执行
mcp__mcp-k8s__get_pods namespace="default"

# 获取任务日志（不使用-f参数）
mcp__mcp-k8s__kubectl command="logs job/job-name -n default"
```

### 常见问题
- **任务启动**: 检查镜像拉取权限和资源配额
- **数据访问**: 验证 RustFS 端点和凭据
- **超时**: 为大型数据集增加 `activeDeadlineSeconds`
- **内存**: 调整资源限制或优化 Python 代码

## 安全要求

- **无硬编码密钥**: 所有凭据使用环境变量
- **资源隔离**: 在适当的 Kubernetes 命名空间中运行
- **自动清理**: 始终包含 `auto-cleanup: "true"` 标签
- **网络安全**: 内部 RustFS 端点与身份验证

## 动态任务生成

创建任务时，您必须：
1. 生成带有时间戳的唯一任务名称
2. 根据任务复杂性调整资源限制
3. 为特定分析需求修改 Python 代码
4. 设置适当的超时值
5. 包含自动清理标签
6. **重要**: 使用 `mcp__mcp-k8s__apply_yaml` 时直接传入YAML内容，不要修改文件

## 文件结构

```
mcp-demo/
├── CLAUDE.md                   # 项目使用指南和MCP工具说明（本文件）
├── .claude/
│   ├── project-settings.json  # 主要规则执行配置
│   └── settings.local.json    # MCP 权限和服务器
├── csv-analysis-job.yaml      # Kubernetes 任务模板
├── report-prompt.md           # HTML 报告生成模板
├── report-generator-template.md # 报告工作流程指令
├── .reports/                  # HTML 报告输出目录
└── Dockerfile                 # Python 环境定义
```

## 重要说明

- 此项目具有**零传统构建过程** - 由配置驱动
- **无测试** - 依赖 MCP 工具验证和手动验证
- **规则执行**通过 Python 钩子自动进行
- 所有数据分析**必须**通过 Kubernetes 任务
- 本地 Python 执行**严格禁止**
- 报告生成使用企业级模板与 Chart.js 集成