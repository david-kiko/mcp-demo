# Kubernetes MCP Demo - 智能路由器

**🎯 单一入口：通过MCP在Kubernetes中执行Python代码，专注数据分析和批处理任务**

## 🚨 执行规则

### 立即执行清单
1. 分析用户输入关键词
2. 匹配对应场景
3. **模糊判断**：检查输入是否明确
   - ✅ **明确匹配**：立即加载指定文档
   - ❓ **模糊输入**：先询问用户确认，再执行
4. **等待加载完成**
5. 按照加载文档的指令执行

### 🤔 模糊输入处理原则
**需要用户确认的情况**：
- 关键词匹配度低于80%
- 输入过于简短（少于4个字符）
- 存在多个可能的场景匹配
- 输入包含"配置"、"设置"等模糊动词

**确认方式**：
```
检测到模糊输入，请确认您的需求：
1. [创建新环境] - 全新创建开发/数据分析环境
2. [配置现有环境] - 为已有开发环境配置本地IDE连接（VS Code/Cursor）
3. [其他] - 请详细说明您的具体需求
```

### 🚨 最高优先级：MCP服务状态检查
**在执行任何场景前，必须首先检查MCP服务状态**：
```bash
claude mcp list
```

**判断逻辑**：
- ✅ **服务正常**：继续执行对应场景
- ✗ **连接失败**：立即执行 `Read(shared/troubleshooting.md)` 并显示错误提示

### 绝对禁止
- **禁止**跳过文档加载直接执行
- **禁止**凭经验记忆操作
- **禁止**不按文档顺序执行

---

## 🎯 场景路由表

### 📊 数据分析场景
**触发条件**：
- 关键词：分析、处理、计算、统计、报告、可视化、批量处理、数据转换、数据挖掘、机器学习、预测
- 文件引用：任何CSV文件名（包括@符号引用）
- 文件操作：本地文件、上传、local file、本地的CSV、本地csv

**路由指令**：
```bash
立即执行：Read(scenarios/data-analysis/README.md)
```

### 💻 开发环境场景
**触发条件**：
- 关键词：创建开发环境、dev environment、开发环境、code-server、IDE环境

**路由指令**：
```bash
立即执行：Read(scenarios/dev-env/README.md)
```

### 🔧 故障排除场景
**触发条件**：
- 关键词：错误、失败、问题、troubleshoot、debug、修复
- 系统异常：MCP工具失败、Kubernetes错误

**路由指令**：
```bash
立即执行：Read(shared/troubleshooting.md)
```

---

## 🔄 执行流程

```
用户输入 → 关键词匹配 → 场景识别 → 立即加载文档 → 等待完成 → 按文档执行
```

**关键**：必须在加载文档完成前，不执行任何其他操作。

---

## 🏗️ 项目架构

### 核心特性
- 🚀 **Kubernetes执行**：通过MCP在K8s集群中运行Python代码
- 📊 **数据分析**：内置CSV分析模板和可视化
- 🔄 **自动化管理**：作业创建、监控、自动清理
- 🧠 **智能路由**：根据用户输入自动选择合适的执行流程

### 环境要求
- **镜像**：`registry.opsman.top/kmai/python:3.12-alpine-data`
- **存储**：RustFS (S3兼容)
- **平台**：Kubernetes集群
- **工具**：MCP Kubernetes + RustFS服务

### 目录结构
```
mcp-demo/
├── CLAUDE.md                      # 本文件 - 智能路由器
├── scenarios/                     # 场景层
│   ├── data-analysis/            # 数据分析分支
│   │   ├── README.md             # 数据分析路由
│   │   ├── workflows/            # 工作流
│   │   └── templates/            # 模板文件
│   └── dev-env/                  # 开发环境分支
│       ├── README.md             # 开发环境路由
│       └── templates/            # 环境模板
├── shared/                       # 共享层
│   ├── constraints.md           # 技术约束
│   └── troubleshooting.md        # 故障排除
├── .generated/                   # 生成文件层（隐藏目录）
│   ├── dev-env/                 # 开发环境生成文件
│   │   └── YYYY-MM/             # 按年月分组
│   ├── data-analysis/           # 数据分析生成文件
│   │   └── YYYY-MM/             # 按年月分组
│   ├── reports/                 # 分析报告生成文件
│   │   └── YYYY-MM/             # 按年月分组
│   └── jobs/                    # 作业生成文件
├── legacy/                       # 遗留文档（已废弃）
```

### 📁 文件管理规范

**生成文件存储原则**：
- 🚫 **禁止**在根目录直接生成YAML文件
- ✅ **必须**使用`.generated/`隐藏目录
- 📅 **按年月分组**：`.generated/{type}/{YYYY-MM}/`
- 🏷️ **命名规范**：`{prefix}-{env-name}-{timestamp}.yaml`

**目录用途**：
- `.generated/dev-env/` - 开发环境相关的生成文件
- `.generated/data-analysis/` - 数据分析作业和配置
- `.generated/reports/` - 分析报告和输出文件（按年月分组）
- `.generated/jobs/` - 其他K8s作业配置

**清理策略**：
- 定期清理超过3个月的生成文件
- 保留重要的配置文件在版本控制中
- 使用gitignore忽略`.generated/`目录

**报告访问**：
- 最新报告：`.generated/reports/latest/`（符号链接到最新报告）
- 历史报告：`.generated/reports/YYYY-MM/`（按月归档）

---

## 🚀 快速开始

### CSV数据分析
```bash
# 简单引用文件名
分析 demo.csv

# 详细分析请求
对销售数据进行深入分析，生成可视化报告
```

### 开发环境
```bash
创建开发环境
启动code-server
```

### 故障排除
```bash
任务失败了，帮我看看问题
分析时出错了
```

---

*本文档采用智能路由设计，一个入口处理所有需求。具体实现逻辑请参考各场景分支文档。*