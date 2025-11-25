# 开发环境路由器

**🎯 职责：根据用户需求路由到对应的工作流**

---

## 🚨 核心设计

### 统一基础环境
- **单一镜像**：registry.opsman.top/kmai/ubuntu:22.04-ide
- **目录预挂载**：/root/.vscode 和 /root/.cursor
- **默认Web版**：创建环境时默认启动VS Code网页版
- **按需配置**：需要时配置本地IDE

---

## 🔄 环境路由

### 🚀 创建开发环境
**触发条件**：创建开发环境、new dev env、IDE、VS Code、Cursor
```bash
立即执行：Read(scenarios/dev-env/workflows/ide-selection.md)
```

### 🔧 配置本地IDE
**触发条件**：配置本地IDE、连接VS Code、setup IDE
```bash
立即执行：Read(scenarios/dev-env/workflows/local-ide-setup.md)
```

### 📋 查看开发环境
**触发条件**：查看开发环境、list dev env、show environments
```bash
立即执行：Read(scenarios/dev-env/workflows/list-envs.md)
```


---

## 📝 触发关键词

### 环境创建
- `创建开发环境` → create-env.md
- `new dev env` → create-env.md
- `IDE` → create-env.md
- `VS Code` → create-env.md
- `Cursor` → create-env.md

### IDE配置
- `配置本地IDE` → setup-ide.md
- `连接VS Code` → setup-ide.md
- `setup IDE` → setup-ide.md

### 环境查看
- `查看开发环境` → list-envs.md
- `list dev env` → list-envs.md
- `show environments` → list-envs.md


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