# 开发环境路由器

**🎯 职责：根据用户需求路由到对应的工作流**

---

## 🚨 核心设计

### 统一基础环境
- **单一镜像**：registry.opsman.top/kmai/ubuntu:22.04-ide
- **目录预挂载**：/root/.vscode
- **默认Web版**：创建环境时默认启动VS Code网页版
- **按需配置**：需要时配置本地IDE

---

## 🔄 环境路由

### 🚀 创建开发环境
**触发条件**：创建开发环境、new dev env、IDE、VS Code
```bash
立即执行：mcp__mcp-rustfs__get_file_content file_path="guides/env-creation.md" bucket="code-server-documents"
```

### 🔧 配置本地IDE
**触发条件**：配置本地IDE、连接VS Code、setup IDE
```bash
立即执行：mcp__mcp-rustfs__get_file_content file_path="guides/ide-connection.md" bucket="code-server-documents"
```

### 📋 查看开发环境
**触发条件**：查看开发环境、list dev env、show environments
```bash
立即执行：mcp__mcp-rustfs__get_file_content file_path="guides/env-management.md" bucket="code-server-documents"
```


---

## 📝 触发关键词

### 环境创建
- `创建开发环境` → mcp__mcp-rustfs__get_file_content file_path="guides/env-creation.md" bucket="code-server-documents"
- `new dev env` → mcp__mcp-rustfs__get_file_content file_path="guides/env-creation.md" bucket="code-server-documents"
- `IDE` → mcp__mcp-rustfs__get_file_content file_path="guides/env-creation.md" bucket="code-server-documents"
- `VS Code` → mcp__mcp-rustfs__get_file_content file_path="guides/env-creation.md" bucket="code-server-documents"

### IDE配置
- `配置本地IDE` → mcp__mcp-rustfs__get_file_content file_path="guides/ide-connection.md" bucket="code-server-documents"
- `连接VS Code` → mcp__mcp-rustfs__get_file_content file_path="guides/ide-connection.md" bucket="code-server-documents"
- `setup IDE` → mcp__mcp-rustfs__get_file_content file_path="guides/ide-connection.md" bucket="code-server-documents"

### 环境管理
- `查看开发环境` → mcp__mcp-rustfs__get_file_content file_path="guides/env-management.md" bucket="code-server-documents"
- `list dev env` → mcp__mcp-rustfs__get_file_content file_path="guides/env-management.md" bucket="code-server-documents"
- `show environments` → mcp__mcp-rustfs__get_file_content file_path="guides/env-management.md" bucket="code-server-documents"
- `删除环境` → mcp__mcp-rustfs__get_file_content file_path="guides/env-management.md" bucket="code-server-documents"
- `故障排除` → mcp__mcp-rustfs__get_file_content file_path="guides/troubleshooting.md" bucket="code-server-documents"


### 🤔 模糊输入处理示例
**典型的模糊输入场景**：
- 包含"配置"、"设置"、"调整"等动词但缺少具体对象
- 输入过于简短（如"环境"、"配置"）
- 可能匹配多个场景的输入

**处理原则**：
- 优先基于通用判断规则（见CLAUDE.md）
- 针对开发环境场景，常见模糊输入需要确认的具体意图：
  1. 创建新环境 vs 修改现有环境
  2. Web环境 vs 本地IDE连接
  3. 环境配置 vs IDE配置

---

*纯路由器，具体实现请参考工作流文档*