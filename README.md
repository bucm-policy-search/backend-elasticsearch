## 搭建思路

### 为什么使用Docker作为主容器
1. 我在服务器申请下来前就已在开发机WSL2环境中研究ELK并进行本地部署，将现有应用迁移到服务器很容易。只需迁移`docker-compose.yml`及其他配置文件即可
2. 是为了避免环境造成的影响，日后系统升级或者升级单个应用不会对其他应用造成影响，方便分析问题。

### 为什么基于ELK 7.12.0 版本
1. Client端兼容性更强。截至2021-04-13，ELK 6.8.14只有Java客户端进行完全兼容，Node.js 6.8.8版本可用，Python端6.X系列更是只兼容了6.8.1，之后就再也没有推进6.8.X新版本兼容，专注7系列更新。而 7.12.0 Java和Node.js都已兼容，Python端虽然目前只有7.11.0，但预计半个月内也能完成兼容。
2. 取消mapping type，和6相比，7可以省略mapping type（如`_doc`类）。此外，7也可以保留mapping type，不像8版本将完全取消mapping type那般激进。因此，7是一个很好的过渡。
3. ELK 7.12.0起支持ARM系统，便于日后用苹果M系列芯片开发成员开发。

### 为什么目前只使用ElasticSearch单节点模式
ES多节点本身是为了整合多服务器设置的，其中分页备份主要是为了避免服务器集群因单节点`物理受损`导致大部分内容损失。所以即使本服务器性能足够，且Docker可以较轻松进行环境分离和多节点模拟，多节点模式并没有什么用。

### initial heap size [536870912] not equal to maximum heap size [1073741824]; this can cause resize pauses and prevents mlockall from locking the entire heap
"ES_JAVA_OPTS=-Xms2g -Xmx2g" # 2 values must be equal