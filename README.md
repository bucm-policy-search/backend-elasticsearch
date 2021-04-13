## 搭建思路

### 为什么使用Docker
1. 我在服务器申请下来前就已在开发机WSL2环境中研究ELK并进行本地部署，将现有应用迁移到服务器很容易。只需迁移`docker-compose.yml`及其他配置文件即可
2. 是为了避免环境造成的影响，日后系统升级或者升级单个应用不会对其他应用造成影响，方便分析问题。

### 为什么目前只使用ElasticSearch单节点模式
ES多节点本身是为了整合多服务器设置的，其中分页备份主要是为了避免服务器集群因单节点`物理受损`导致大部分内容损失。所以即使本服务器性能足够，且Docker可以较轻松进行环境分离和多节点模拟，多节点模式并没有什么用。

### initial heap size [536870912] not equal to maximum heap size [1073741824]; this can cause resize pauses and prevents mlockall from locking the entire heap
"ES_JAVA_OPTS=-Xms2g -Xmx2g" # 2 values must be equal