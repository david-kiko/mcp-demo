# 查看开发环境工作流

**🎯 职责：显示所有开发环境的状态和访问信息**

---

## 🔄 执行步骤

### 步骤1：获取环境列表
```bash
environments=$(kubectl get pods -l app=dev-env -n default -o name)
```

### 步骤2：显示环境信息
```bash
echo "📋 当前开发环境列表："
echo ""

for env in $environments; do
    pod_name=$(echo $env | cut -d'/' -f2)
    deployment_name=$(echo $pod_name | rev | cut -d'-' -f3- | rev)

    # 获取状态信息
    status=$(kubectl get pod $pod_name -n default -o jsonpath='{.status.phase}')
    create_time=$(kubectl get pod $pod_name -n default -o jsonpath='{.metadata.creationTimestamp}' | cut -d'T' -f1)

    # 获取端口信息
    web_port=$(kubectl get service ${deployment_name}-service -n default -o jsonpath='{.spec.ports[?(@.name==\"vscode-web\")].nodePort}' 2>/dev/null)
    ssh_port=$(kubectl get service ${deployment_name}-service -n default -o jsonpath='{.spec.ports[?(@.name=="ssh\")].nodePort}' 2>/dev/null)
    node_ip=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type==\"ExternalIP\")].address}')

    echo "📦 ${deployment_name}"
    echo "   状态: ${status}"
    echo "   创建时间: ${create_time}"

    if [ -n "$web_port" ]; then
        echo "   🌐 VS Code Web: http://${node_ip}:${web_port}"
    fi

    if [ -n "$ssh_port" ]; then
        echo "   🔗 SSH: ssh user@${node_ip} -p ${ssh_port}"
    fi

    echo ""
done
```

---

*显示所有开发环境的当前状态和访问方式*