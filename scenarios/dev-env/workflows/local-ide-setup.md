# 配置本地IDE工作流

**🎯 职责：为现有开发环境配置本地IDE连接**

---

## 🔄 执行流程概览

```bash
# 步骤1：选择环境 -> 步骤2：选择IDE类型 -> 步骤3：获取commit id -> 步骤4：检查RustFS目录 -> 步骤5：选择安装方法 -> 步骤6：安装配置 -> 步骤7：输出连接信息
```

---

## 📋 VS Code Server安装方法说明

### 🔍 两种安装方法对比

| 特性 | 旧方法 (bin目录结构) | 新方法 (CLI目录结构) |
|------|---------------------|---------------------|
| **包类型** | vscode-server + vscode-reh | vscode_cli_alpine_x64_cli.tar.gz |
| **目录** | `/root/.vscode-server/bin/${commit_id}/` | `/root/.vscode-server/cli/` |
| **文件大小** | 较大（多个包） | 较小（单一CLI包） |
| **兼容性** | 传统方式，兼容性好 | 新方式，推荐使用 |

### 📁 最终目录结构

**统一的.vscode-server目录结构：**
```
📦.vscode-server
┣━ 📁 bin                      # 存放旧方法下的vscode commit相关文件
┃   ┗━ 📁 ${commit_id1}         # 旧方法：特定版本的vscode-server文件
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

**目录结构说明：**
- **bin/**：旧方法专用，包含传统vscode-server + vscode-reh文件结构
- **cli/**：新方法专用，包含CLI方式的配置和服务器文件
- **code-${commit_id}**：新方法CLI可执行文件，从vscode_cli_alpine_x64_cli.tar.gz解压得到
- **iru.json**：记录当前使用的commit信息，格式：`{"commit": "${commit_id}", "version": "stable"}`

### 🎯 安装方法选择逻辑

```bash
# 🚨 重要：禁止进行commit id格式校验！
# 无论用户输入什么格式，都直接使用，通过检查RustFS目录是否存在来判断有效性

# 检查VS Code Server包可用性
mcp__mcp-rustfs__list_buckets

# 检查旧方法包（vscode-server + vscode-reh）
old_method_server=$(mcp__mcp-rustfs__check_file_exists file_path="${commit_id}/vscode-server-linux-x64.tar.gz" bucket="vscode")
old_method_reh=$(mcp__mcp-rustfs__check_file_exists file_path="${commit_id}/vscode-reh-linux-x64.tar.gz" bucket="vscode")

# 检查新方法包（CLI包）
new_method_cli=$(mcp__mcp-rustfs__check_file_exists file_path="${commit_id}/vscode_cli_alpine_x64_cli.tar.gz" bucket="vscode")

# 判断使用哪种方法
if [ "${old_method_server}" = "true" ] && [ "${old_method_reh}" = "true" ]; then
    vscode_method="old"
    echo "✅ 找到旧方法VS Code包（vscode-server + vscode-reh），将使用bin目录结构"
    # 路由到：vscode-server-old-method.md
elif [ "${old_method_server}" = "true" ] && [ "${new_method_cli}" = "true" ]; then
    vscode_method="new"
    echo "✅ 找到新方法VS Code包（vscode-server + CLI），将使用CLI目录结构"
    # 路由到：vscode-server-new-method.md
elif [ "${new_method_cli}" = "true" ]; then
    vscode_method="new_partial"
    echo "⚠️  只找到CLI包，缺少服务器端包，功能可能不完整"
    echo "💡 建议使用包含vscode-server-linux-x64.tar.gz的commit id"
    # 路由到：vscode-server-new-method.md
else
    vscode_method="unavailable"
    echo "⚠️  指定的commit id在RustFS中未找到对应的VS Code包"
    echo "💡 可选方案："
    echo "   1. 输入另一个commit id"
    echo "   2. 使用code-server作为备选方案"
    # 继续等待用户决策
fi
```

### 🔍 安装方法检查函数

```bash
# 检查当前使用的安装方法
check_vscode_installation_method() {
  kubectl exec deployment/${selected_env} -- /bin/bash -c "
    echo '🔍 检查VS Code Server安装方法：'

    # 检查旧方法
    if [ -d '/root/.vscode-server/bin' ] && [ \"\$(ls -A /root/.vscode-server/bin 2>/dev/null)\" ]; then
      echo '✅ 检测到旧方法安装 (bin目录结构)'
      ls -la /root/.vscode-server/bin/ 2>/dev/null || echo '目录为空'
    else
      echo '❌ 未检测到旧方法安装'
    fi

    # 检查新方法
    if [ -f '/root/.vscode-server/cli/iru.json' ] && [ -f '/root/.vscode-server/code-'* ]; then
      echo '✅ 检测到新方法安装 (CLI结构)'
      echo '📋 当前commit信息：'
      cat /root/.vscode-server/cli/iru.json
      echo '📋 CLI可执行文件：'
      ls -la /root/.vscode-server/code-*
      echo '📁 CLI目录结构：'
      ls -la /root/.vscode-server/cli/servers/
    else
      echo '❌ 未检测到新方法安装'
    fi

    echo ''
    echo '📁 完整目录结构：'
    find /root/.vscode-server/ -type f -exec ls -la {} \; 2>/dev/null || echo '无文件'
  "
}
```

---

## 🛣️ 方法路由

根据检测结果，路由到对应的详细安装文档：

### 🆕 新方法安装
**条件**：检测到 `vscode-server-linux-x64.tar.gz` + `vscode_cli_alpine_x64_cli.tar.gz`
**特点**：创建 `cli/servers/Stable-${commit_id}/server/` 目录和 `code-${commit_id}` 文件
**文件说明**：
- `vscode-server-linux-x64.tar.gz` → 解压后重命名为 `server` 放入 `cli/servers/Stable-${commit_id}/`
- `vscode_cli_alpine_x64_cli.tar.gz` → 解压后重命名为 `code-${commit_id}` 放入 `.vscode-server/`
**路由到**：[local-ide-setup-1.md](./local-ide-setup-1.md)

### 🔄 旧方法安装
**条件**：检测到 `vscode-server-linux-x64.tar.gz` + `vscode-reh-linux-x64.tar.gz`
**特点**：创建 `bin/${commit_id}/` 目录结构
**文件说明**：
- `vscode-server-linux-x64.tar.gz` → 解压后放入 `bin/${commit_id}/`
- `vscode-reh-linux-x64.tar.gz` → 解压后放入 `bin/${commit_id}/`
**路由到**：[local-ide-setup-2.md](./local-ide-setup-2.md)

---

## 📤 输出连接信息（通用）

```bash
ssh_port=$(kubectl get service ${selected_env}-service -n default -o jsonpath='{.spec.ports[?(@.name=="ssh\")].nodePort}')
# 优先获取ExternalIP，如果没有则使用InternalIP
node_ip=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP\")].address}')
if [ -z "$node_ip" ]; then
    node_ip=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP\")].address}')
fi

echo "✅ VS Code Server配置完成！"
echo "SSH连接信息（镜像已配置）："
echo "  用户名: root"
echo "  端口: ${ssh_port}"
echo "  节点IP: ${node_ip}"
echo "工作目录: /workspace"
echo ""
echo "💡 连接方式："
echo "   命令行: ssh -p ${ssh_port} root@${node_ip}"
echo "   VS Code: 使用Remote-SSH插件，主机: ${node_ip}, 端口: ${ssh_port}, 用户: root"
echo ""
echo "⚠️  注意：SSH命令必须使用 -p 参数指定端口，格式: ssh -p <port> <user>@<host>"
```