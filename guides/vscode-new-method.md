# VS Code 新方法安装指南

**🎯 使用CLI包安装VS Code（推荐）**

---

## 📋 概述

新方法使用两个包进行安装：`vscode-server-linux-x64.tar.gz` 和 `vscode_cli_alpine_x64_cli.tar.gz`，具有以下优势：

- ✅ **标准结构**：按照官方.vscode-server目录结构
- ✅ **完整功能**：包含服务器端和CLI工具
- ✅ **兼容性好**：适用于最新的VS Code版本
- ✅ **性能优化**：CLI方式启动更快速

**所需文件**：
- `vscode-server-linux-x64.tar.gz` - VS Code服务器端文件
- `vscode_cli_alpine_x64_cli.tar.gz` - CLI可执行文件

**目标目录结构：**
```
📦.vscode-server
┣━ 📁 bin                      # 存放旧方法下的vscode commit相关文件
┃   ┗━ 📁 ${commit_id1}
┃   ┗━ 📁 ${commit_id2}
┃   ┗━ ···
┣━ 📁 cli                      # 存放新方法下的vscode commit相关文件
┃   ┗━ 📁 servers
┃   ┃   ┗━ 📁 Stable-${commit_id}
┃   ┃   ┃   ┗━ 📁 server       # VS Code服务器相关文件
┃   ┃   ┃   ┗━ ···
┃   ┃   ┗━ ···
┃   ┗━ 📜 iru.json             # 存放最近的vscode commit_id
┣━ 📜 code-${commit_id}         # 新方法：CLI可执行文件（vscode_cli解压后重命名）
┣━ 📁 data                     # VS Code用户数据
┗━ 📁 extensions               # 扩展目录
```

---

## 🔄 安装步骤

### 步骤1：创建目录结构

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 创建VS Code CLI目录结构...'

  # 创建新方法目录结构
  mkdir -p /root/.vscode-server/cli/servers/Stable-${commit_id}
  mkdir -p /root/.vscode-server/data
  mkdir -p /root/.vscode-server/extensions

  echo '✅ 目录结构创建完成'
"
```

### 步骤2：下载VS Code包

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 下载VS Code服务器端包...'

  # 获取服务器端包下载URL
  server_url=\$(mcp__mcp-rustfs__get_download_url file_path=\"${commit_id}/vscode-server-linux-x64.tar.gz\" bucket=\"vscode\")

  # 下载服务器端包
  wget -O /tmp/vscode-server.tar.gz \"\${server_url}\"

  echo '✅ VS Code服务器端包下载完成'

  echo '🔄 下载VS Code CLI包...'

  # 获取CLI包下载URL
  cli_url=\$(mcp__mcp-rustfs__get_download_url file_path=\"${commit_id}/vscode_cli_alpine_x64_cli.tar.gz\" bucket=\"vscode\")

  # 下载CLI包
  wget -O /tmp/vscode-cli.tar.gz \"\${cli_url}\"

  echo '✅ VS Code CLI包下载完成'
  echo '📦 两个包都已下载完成'
"
```

### 步骤3：解压并部署

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 解压并部署VS Code服务器端文件...'

  # 解压服务器端包到临时目录
  tar -xzf /tmp/vscode-server.tar.gz -C /tmp/

  # 重命名服务器端目录并移动到正确位置
  if [ -d /tmp/vscode-server-linux-x64 ]; then
    mv /tmp/vscode-server-linux-x64 /tmp/server
    mv /tmp/server /root/.vscode-server/cli/servers/Stable-${commit_id}/
    echo '✅ VS Code服务器端文件部署完成'
  else
    echo '❌ 错误：解压后未找到vscode-server-linux-x64目录'
    exit 1
  fi

  echo '🔄 解压并部署VS Code CLI...'

  # 解压CLI包到临时目录
  tar -xzf /tmp/vscode-cli.tar.gz -C /tmp/

  # 重命名CLI可执行文件
  if [ -f /tmp/code ]; then
    mv /tmp/code /root/.vscode-server/code-${commit_id}
    echo '✅ VS Code CLI可执行文件重命名完成'
  else
    echo '❌ 错误：解压后未找到code可执行文件'
    exit 1
  fi
"
```

### 步骤4：创建配置文件

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 创建VS Code配置文件...'

  # 创建配置文件记录commit信息（存放于cli目录下）
  sh -c 'echo \"[\\\"Stable-${commit_id}\\\"]\" > /root/.vscode-server/cli/iru.json'

  echo '✅ 配置文件iru.json创建完成'
"
```

### 步骤5：验证安装结果

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔍 验证新方法安装结果...'

  # 检查CLI可执行文件
  if [ -f '/root/.vscode-server/code-${commit_id}' ]; then
    echo '✅ CLI可执行文件：'
    ls -la /root/.vscode-server/code-${commit_id}
  else
    echo '❌ 未找到CLI可执行文件'
  fi

  # 检查服务器端文件
  if [ -d '/root/.vscode-server/cli/servers/Stable-${commit_id}/server' ]; then
    echo '✅ 服务器端目录结构：'
    ls -la /root/.vscode-server/cli/servers/Stable-${commit_id}/server/
  else
    echo '❌ 未找到服务器端目录'
  fi

  # 检查配置文件
  if [ -f '/root/.vscode-server/cli/iru.json' ]; then
    echo '✅ 配置文件内容：'
    cat /root/.vscode-server/cli/iru.json
  else
    echo '❌ 未找到配置文件'
  fi

  # 检查完整目录结构
  echo '📁 CLI目录结构：'
  ls -la /root/.vscode-server/cli/servers/

  echo '📁 完整结构检查：'
  find /root/.vscode-server/ -name '*${commit_id}*' -exec ls -la {} \;
"
```

### 步骤6：清理临时文件

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 清理临时文件...'

  # 清理临时文件
  rm -f /tmp/vscode-server.tar.gz /tmp/vscode-cli.tar.gz

  echo '✅ 临时文件清理完成'
  echo '🎉 新方法VS Code安装完成！'
  echo '📋 已安装：'
  echo '   - VS Code服务器端文件'
  echo '   - VS Code CLI可执行文件'
  echo '   - 配置文件iru.json'
"
```

---

## 🔗 相关链接

- [返回主文档](./local-ide-setup.md)
- [旧方法安装](./local-ide-setup-2.md)