# 创建开发环境工作流

**🎯 职责：创建统一开发环境，默认启动VS Code网页版**

---

## 🔄 执行步骤

### 步骤1：收集环境配置
```bash
AskUserQuestion questions=[{
    "question": "请选择开发环境配置",
    "header": "环境配置",
    "options": [
        {"label": "个人开发", "description": "轻量资源（2CPU, 4GB内存, 10GB存储）"},
        {"label": "团队开发", "description": "标准资源（4CPU, 8GB内存, 20GB存储）"},
        {"label": "大型项目", "description": "高配资源（8CPU, 16GB内存, 50GB存储）"}
    ],
    "multiSelect": false
}]
```

### 步骤2：收集环境名称

**🔄 执行逻辑**：如果选择自定义名称，流程暂停等待输入

```bash
AskUserQuestion questions=[{
    "question": "请选择环境名称方式",
    "header": "环境名称",
    "options": [
        {"label": "自动生成", "description": "系统自动生成环境标识"},
        {"label": "自定义名称", "description": "手动输入环境名称"}
    ],
    "multiSelect": false
}]

# 如果选择自定义名称，流程停止等待输入
if [ "${name_choice}" = "自定义名称" ]; then
    echo "🛑 流程暂停：需要输入自定义环境名称"
    echo "📋 Kubernetes环境名称要求："
    echo "   - 长度：1-63个字符"
    echo "   - 格式：只能包含小写字母、数字、连字符(-)"
    echo "   - 限制：必须以字母或数字开头和结尾"
    echo "   - 示例：my-dev-env, project1, test-env-01"
    echo "⚠️  注意：名称将用于Kubernetes资源创建，必须符合K8s命名规范"
    echo "⏳ 请直接在此输入您的环境名称："

    # 等待用户输入...（流程在此停止）
    # 用户需要直接在聊天中输入环境名称

    # 待用户输入后，验证格式并继续
    if [ ${#env_name} -lt 1 ] || [ ${#env_name} -gt 63 ]; then
        echo "❌ 环境名称长度不符合要求（1-63个字符）"
        echo "🔄 请重新输入正确的环境名称"
        # 流程继续等待输入
    elif [[ ! $env_name =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]]; then
        echo "❌ 环境名称格式不符合Kubernetes要求"
        echo "💡 要求：只能包含小写字母、数字、连字符(-)"
        echo "💡 要求：必须以字母或数字开头和结尾"
        echo "🔄 请重新输入正确的环境名称"
        # 流程继续等待输入
    elif [[ $env_name =~ -- ]]; then
        echo "❌ 环境名称不能包含连续的连字符(--)"
        echo "🔄 请重新输入正确的环境名称"
        # 流程继续等待输入
    else
        echo "✅ 环境名称格式正确：${env_name}"
        echo "ℹ️  将创建Kubernetes资源：${env_name}-deployment, ${env_name}-service等"
    fi
else
    # 自动生成环境名称
    timestamp=$(date +%Y%m%d-%H%M%S)
    env_name="dev-env-${timestamp}"
    echo "✅ 已自动生成环境名称：${env_name}"
fi
```

### 步骤3：生成参数
```bash
timestamp=$(date +%Y%m%d-%H%M%S)
if [ "$name_choice" = "auto" ]; then
    env_name="dev-env-${timestamp}"
else
    env_name="dev-env-${user_input}-${timestamp}"
fi

# 资源配置
case $resource_level in
    "personal") cpu="1000m/2000m"; memory="2Gi/4Gi"; storage="10Gi" ;;
    "team") cpu="2000m/4000m"; memory="4Gi/8Gi"; storage="20Gi" ;;
    "large") cpu="4000m/8000m"; memory="8Gi/16Gi"; storage="50Gi" ;;
esac

# 生成密码
access_password=$(openssl rand -base64 10 | tr -d "=+/" | cut -c1-8)
```

### 步骤4：应用模板
```bash
立即执行：Read(scenarios/dev-env/templates/dev-env.yaml)
```

### 步骤5：验证和输出
```bash
mcp__mcp-k8s__get_pods namespace="default"

# 输出访问信息
web_port=$(mcp__mcp-k8s__kubectl command="get service ${env_name}-service -n default -o jsonpath='{.spec.ports[?(@.name==\"vscode-web\")].nodePort}'")
node_ip=$(mcp__mcp-k8s__kubectl command="get nodes -o jsonpath='{.items[0].status.addresses[?(@.type==\"ExternalIP\")].address}'")

echo "✅ 开发环境创建成功！"
echo "环境名称: ${env_name}"
echo "Web访问: http://${node_ip}:${web_port}"
echo "访问密码: ${access_password}"
echo "💡 如需本地IDE连接，请说：'配置本地IDE'"
```

---

*创建完成的环境默认启动VS Code网页版，支持后续配置本地IDE*