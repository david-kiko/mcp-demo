# 创建开发环境工作流

**🎯 职责：创建统一开发环境，默认启动VS Code网页版**

---

## 🔄 执行步骤

### 步骤1：收集环境配置
```bash
echo "🛑 流程暂停：需要输入环境配置"
echo "📋 可用配置选项："
echo "   1. 个人开发 - 轻量资源（2CPU, 4GB内存, 10GB存储）"
echo "   2. 团队开发 - 标准资源（4CPU, 8GB内存, 20GB存储）"
echo "   3. 大型项目 - 高配资源（8CPU, 16GB内存, 50GB存储）"
echo "⏳ 请直接在此输入配置选项（1/2/3）或配置名称（个人开发/团队开发/大型项目）："

# 等待用户输入...（流程在此停止）
# 用户需要直接在聊天中输入配置选项

# 待用户输入后，解析配置
if [[ "$user_input" =~ ^(1|个人开发)$ ]]; then
    resource_level="personal"
    echo "✅ 已选择：个人开发配置"
elif [[ "$user_input" =~ ^(2|团队开发)$ ]]; then
    resource_level="team"
    echo "✅ 已选择：团队开发配置"
elif [[ "$user_input" =~ ^(3|大型项目)$ ]]; then
    resource_level="large"
    echo "✅ 已选择：大型项目配置"
else
    echo "❌ 无效的配置选项，请输入：1/2/3 或 个人开发/团队开发/大型项目"
    echo "🔄 请重新输入正确的配置选项"
    # 流程继续等待输入
fi
```

### 步骤2：收集环境名称

```bash
echo "🛑 流程暂停：需要输入环境名称"
echo "📋 Kubernetes环境名称要求："
echo "   - 长度：1-63个字符"
echo "   - 格式：只能包含小写字母、数字、连字符(-)"
echo "   - 限制：必须以字母或数字开头和结尾"
echo "   - 示例：my-dev-env, project1, test-env-01"
echo "💡 选项："
echo "   - 直接输入环境名称（如：my-dev-env）"
echo "   - 输入 'auto' 或 '自动' 使用自动生成名称"
echo "⚠️  注意：名称将用于Kubernetes资源创建，必须符合K8s命名规范"
echo "⏳ 请直接在此输入您的环境名称或选择自动生成："

# 等待用户输入...（流程在此停止）
# 用户需要直接在聊天中输入环境名称或选择自动生成

# 待用户输入后，解析并验证
if [[ "$user_input" =~ ^(auto|自动|AUTO)$ ]]; then
    # 自动生成环境名称
    # 使用K8s环境获取时间戳
    timestamp=$(mcp__mcp-k8s__kubectl_exec command="exec deployment/ubuntu-deployment -- date +%Y%m%d-%H%M%S" | jq -r '.output')
    env_name="dev-env-${timestamp}"
    echo "✅ 已自动生成环境名称：${env_name}"
else
    # 自定义环境名称
    env_name="$user_input"

    # 验证格式
    if [ ${#env_name} -lt 1 ] || [ ${#env_name} -gt 63 ]; then
        echo "❌ 环境名称长度不符合要求（1-63个字符）"
        echo "🔄 请重新输入正确的环境名称或输入 'auto' 使用自动生成"
        # 流程继续等待输入
    elif [[ ! $env_name =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]]; then
        echo "❌ 环境名称格式不符合Kubernetes要求"
        echo "💡 要求：只能包含小写字母、数字、连字符(-)"
        echo "💡 要求：必须以字母或数字开头和结尾"
        echo "🔄 请重新输入正确的环境名称或输入 'auto' 使用自动生成"
        # 流程继续等待输入
    elif [[ $env_name =~ -- ]]; then
        echo "❌ 环境名称不能包含连续的连字符(--)"
        echo "🔄 请重新输入正确的环境名称或输入 'auto' 使用自动生成"
        # 流程继续等待输入
    else
        echo "✅ 环境名称格式正确：${env_name}"
        echo "ℹ️  将创建Kubernetes资源：${env_name}-deployment, ${env_name}-service等"
    fi
fi
```

### 步骤3：生成参数
```bash
# env_name 和 resource_level 已在前面步骤中确定

# 资源配置
case $resource_level in
    "personal")
        cpu_request="1000m"
        cpu_limit="2000m"
        memory_request="2Gi"
        memory_limit="4Gi"
        storage="10Gi"
        echo "✅ 资源配置：个人开发（2CPU, 4GB内存, 10GB存储）"
        ;;
    "team")
        cpu_request="2000m"
        cpu_limit="4000m"
        memory_request="4Gi"
        memory_limit="8Gi"
        storage="20Gi"
        echo "✅ 资源配置：团队开发（4CPU, 8GB内存, 20GB存储）"
        ;;
    "large")
        cpu_request="4000m"
        cpu_limit="8000m"
        memory_request="8Gi"
        memory_limit="16Gi"
        storage="50Gi"
        echo "✅ 资源配置：大型项目（8CPU, 16GB内存, 50GB存储）"
        ;;
esac

# 收集密码配置
echo "🛑 流程暂停：需要输入访问密码"
echo "📋 密码配置选项："
echo "   1. 自动生成 - 随机8位密码"
echo "   2. 自定义密码 - 自己输入密码"
echo "💡 自动生成密码更安全，建议使用"
echo "⏳ 请直接在此输入配置选项（1/2）或配置名称（自动生成/自定义密码）："

# 等待用户输入...（流程在此停止）
# 用户需要直接在聊天中输入配置选项

# 待用户输入后，解析配置
if [[ "$user_input" =~ ^(1|自动生成)$ ]]; then
    # 自动生成密码
    access_password=$(mcp__mcp-k8s__kubectl_exec command="exec deployment/ubuntu-deployment -- openssl rand -base64 10 | tr -d '=+/' | cut -c1-8" | jq -r '.output')
    echo "✅ 已自动生成访问密码：${access_password}"
elif [[ "$user_input" =~ ^(2|自定义密码)$ ]]; then
    # 自定义密码
    echo "🛑 流程暂停：需要输入自定义密码"
    echo "📋 密码要求："
    echo "   - 长度：建议8-20个字符"
    echo "   - 格式：可包含字母、数字、特殊字符"
    echo "   - 安全：建议包含大小写字母和数字"
    echo "⏳ 请直接在此输入您的密码："

    # 等待用户输入...（流程在此停止）
    access_password="$user_input"

    # 验证密码
    if [ ${#access_password} -lt 4 ]; then
        echo "❌ 密码长度太短，至少需要4个字符"
        echo "🔄 请重新输入密码"
        # 流程继续等待输入
    else
        echo "✅ 已设置自定义密码：${access_password}"
    fi
else
    echo "❌ 无效的配置选项，请输入：1/2 或 自动生成/自定义密码"
    echo "🔄 请重新输入正确的配置选项"
    # 流程继续等待输入
fi

# 生成随机端口（使用MCP工具）
echo "🔄 正在生成网络端口..."
# 生成VS Code Web端口（30000-30999范围）
web_port=$(mcp__mcp-k8s__kubectl_exec command="exec deployment/ubuntu-deployment -- bash -c 'echo \$((30000 + \$(od -An -N2 -i /dev/urandom) % 1000))'" | jq -r '.output')
# 生成SSH端口（31000-31999范围）
ssh_port=$(mcp__mcp-k8s__kubectl_exec command="exec deployment/ubuntu-deployment -- bash -c 'echo \$((31000 + \$(od -An -N2 -i /dev/urandom) % 1000))'" | jq -r '.output')
# 生成Web Terminal端口（32000-32767范围，确保在K8s NodePort范围内）
ttyd_port=$(mcp__mcp-k8s__kubectl_exec command="exec deployment/ubuntu-deployment -- bash -c 'echo \$((32000 + \$(od -An -N2 -i /dev/urandom) % 768))'" | jq -r '.output')

echo "✅ 端口配置完成："
echo "   VS Code Web端口: ${web_port}"
echo "   SSH端口: ${ssh_port}"
echo "   Web Terminal端口: ${ttyd_port}"

echo "📋 环境参数总结："
echo "   环境名称: ${env_name}"
echo "   CPU配置: ${cpu_request}/${cpu_limit}"
echo "   内存配置: ${memory_request}/${memory_limit}"
echo "   存储配置: ${storage}"
echo "   访问密码: ${access_password}"
echo "   VS Code Web端口: ${web_port}"
echo "   SSH端口: ${ssh_port}"
echo "   Web Terminal端口: ${ttyd_port}"
```

### 步骤4：读取模板并部署

#### 🚨 严格禁止：
- **禁止使用Write工具**
- **禁止使用Edit工具**
- **禁止创建任何本地文件和目录**
- **禁止使用任何文件路径概念**

#### ✅ 必须执行：
- **全程在内存中处理**
- **直接使用MCP工具序列**
- **保持职责分离**

#### 具体执行步骤：

**步骤4.1：读取部署模板**
```
立即执行：mcp__mcp-rustfs__get_file_content file_path="templates/dev-env.yaml" bucket="code-server-documents"
```

**步骤4.2：在内存中替换参数**
使用文本替换功能将模板中的占位符替换为实际值：
- `{deployment_name}` → env_name
- `{pvc_name_workspace}` → env_name-workspace
- `{pvc_name_vscode}` → env_name-vscode
- `{service_name}` → env_name-service
- `{access_password}` → access_password
- `{ssh_password}` → access_password
- `{web_node_port}` → web_port
- `{ssh_node_port}` → ssh_port
- `{ttyd_node_port}` → ttyd_port
- `{storage_size}` → storage
- `{cpu_request}` → cpu_request
- `{cpu_limit}` → cpu_limit
- `{memory_request}` → memory_request
- `{memory_limit}` → memory_limit

**步骤4.3：直接部署**
使用专用的kubectl_apply工具直接部署处理后的YAML内容：

```
立即执行：mcp__mcp-k8s__kubectl_apply \
  yaml_content="[替换后的完整YAML内容]" \
  namespace="default"
```

🔧 **工具优势**：
- 专门的apply工具，无需heredoc语法
- 自动处理临时文件创建和清理
- 支持直接传递YAML内容参数
- 提供清晰的部署反馈和错误信息

### 步骤5：验证和输出
```bash
# 等待部署完成
mcp__mcp-k8s__get_pods namespace="default"

# 获取访问信息（使用已生成的端口）
node_ip=$(mcp__mcp-k8s__kubectl_exec command="get nodes -o jsonpath='{.items[0].status.addresses[?(@.type==\"ExternalIP\")].address}'" | jq -r '.output')

echo "✅ 开发环境创建成功！"
echo "环境名称: ${env_name}"
echo "VS Code Web访问: http://${node_ip}:${web_port}"
echo "SSH访问: ssh root@${node_ip} -p ${ssh_port}"
echo "Web Terminal访问: http://${node_ip}:${ttyd_port}"
echo "访问密码: ${access_password}"
echo "💡 如需本地IDE连接，请说：'配置本地IDE'"
```

---

*创建完成的环境默认启动VS Code网页版，支持后续配置本地IDE*