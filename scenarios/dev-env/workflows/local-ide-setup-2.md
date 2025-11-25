# VS Code 旧方法安装指南

**🎯 使用传统vscode-server包安装（兼容性方案）**

---

## 📋 概述

旧方法使用 `vscode-server-linux-x64.tar.gz` + `vscode-reh-linux-x64.tar.gz` 两个包进行安装，适用于：

- 🔄 **传统环境**：需要兼容旧版本VS Code Server
- 🔄 **特殊需求**：需要完整的server + REH环境
- 🔄 **回退方案**：当新方法CLI包不可用时的备选

**目标目录结构（bin目录）：**
```
📦.vscode-server
┣━ 📁 bin
┃   ┗━ 📁 ${commit_id}            # 旧方法：存放vscode-server文件
┃       ┗━ 📁 bin                # Node.js和相关二进制文件
┃       ┗━ 📁 extensions         # 内置扩展
┃       ┗━ 📁 resources          # 资源文件
┣━ 📁 data
┗━ 📁 extensions
```

---

## 🔄 安装步骤

### 步骤1：创建目录结构

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 创建VS Code传统bin目录结构...'

  # 创建旧方法目录结构
  mkdir -p /root/.vscode-server/bin/${commit_id}
  mkdir -p /root/.vscode-server/data
  mkdir -p /root/.vscode-server/extensions

  echo '✅ 传统bin目录结构创建完成'
"
```

### 步骤2：下载服务器包

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 下载VS Code Server包...'

  # 获取服务器包下载URL
  server_url=\$(mcp__mcp-rustfs__get_download_url file_path=\"${commit_id}/vscode-server-linux-x64.tar.gz\" bucket=\"vscode\")

  # 🔧 使用Base64编码绕过kubectl exec字符转义限制
  server_command=\"wget -O /tmp/vscode-server.tar.gz \\\"\${server_url}\\\"\"

  # 在容器中解码并执行下载命令
  echo \"\${server_command}\" | base64 -d | sh

  echo '✅ VS Code Server包下载完成'
"
```

### 步骤3：下载REH包

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 下载VS Code REH包...'

  # 获取REH包下载URL
  reh_url=\$(mcp__mcp-rustfs__get_download_url file_path=\"${commit_id}/vscode-reh-linux-x64.tar.gz\" bucket=\"vscode\")

  # 🔧 使用Base64编码绕过kubectl exec字符转义限制
  reh_command=\"wget -O /tmp/vscode-reh.tar.gz \\\"\${reh_url}\\\"\"

  # 在容器中解码并执行下载命令
  echo \"\${reh_command}\" | base64 -d | sh

  echo '✅ VS Code REH包下载完成'
"
```

### 步骤4：解压部署包

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 解压并部署VS Code Server包...'

  # 解压服务器包到bin目录
  tar -xzf /tmp/vscode-server.tar.gz -C /root/.vscode-server/bin/${commit_id}
  echo '✅ Server包解压完成'

  # 解压REH包到bin目录
  tar -xzf /tmp/vscode-reh.tar.gz -C /root/.vscode-server/bin/${commit_id}
  echo '✅ REH包解压完成'
"
```

### 步骤5：验证安装结果

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔍 验证旧方法安装结果...'

  # 检查bin目录内容
  if [ -d '/root/.vscode-server/bin/${commit_id}' ]; then
    echo '✅ bin目录内容：'
    ls -la /root/.vscode-server/bin/${commit_id}/

    # 检查关键文件
    echo '🔍 关键文件检查：'
    find /root/.vscode-server/bin/${commit_id}/ -name 'node' -exec ls -la {} \; 2>/dev/null || echo '未找到node可执行文件'
    find /root/.vscode-server/bin/${commit_id}/ -name '*server*' -type f -exec ls -la {} \; 2>/dev/null || echo '未找到server文件'

    # 检查目录结构
    echo '📁 详细目录结构：'
    find /root/.vscode-server/bin/${commit_id}/ -maxdepth 2 -type d
  else
    echo '❌ 未找到bin目录'
  fi

  # 检查是否包含cli相关内容（应该没有）
  echo '📋 确认旧方法特性：'
  if [ ! -f '/root/.vscode-server/cli/iru.json' ] && [ ! -f '/root/.vscode-server/code-'* ]; then
    echo '✅ 确认为纯旧方法安装（无CLI文件）'
  else
    echo '⚠️  检测到CLI文件，可能是混合安装'
  fi
"
```

### 步骤6：功能测试

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔧 功能测试...'

  # 测试Node.js是否可用
  if [ -f '/root/.vscode-server/bin/${commit_id}/bin/node' ]; then
    echo '✅ Node.js版本信息：'
    /root/.vscode-server/bin/${commit_id}/bin/node --version 2>/dev/null || echo 'Node.js执行失败'
  else
    echo '❌ 未找到Node.js可执行文件'
  fi

  # 测试服务器脚本是否存在
  server_scripts=\$(find /root/.vscode-server/bin/${commit_id}/ -name '*.js' | wc -l)
  echo "✅ 找到 ${server_scripts} 个JavaScript文件"

  # 检查bin目录大小
  bin_size=\$(du -sh /root/.vscode-server/bin/${commit_id}/ 2>/dev/null | cut -f1)
  echo "✅ bin目录大小：${bin_size}"
"
```

### 步骤7：清理临时文件

```bash
kubectl exec deployment/${selected_env} -- /bin/bash -c "
  echo '🔄 清理临时文件...'

  # 清理临时文件
  rm -f /tmp/vscode-server.tar.gz /tmp/vscode-reh.tar.gz

  echo '✅ 临时文件清理完成'
  echo '🎉 旧方法VS Code安装完成！'
"
```

---

## 🔗 相关链接

- [返回主文档](./local-ide-setup.md)
- [新方法安装](./local-ide-setup-1.md)