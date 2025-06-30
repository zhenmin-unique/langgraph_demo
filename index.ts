import dagDefault from "./src/dag/default";
import dagCondition from "./src/dag/condition";
import nonPersistent from "./src/store/non-persistent";
import persistent from "./src/store/persistent";
import humanInterrupt from "./src/interrupt";
import replay from "./src/replay";
import functionCalling from "./src/tools";
import homologySubgraph from "./src/subgraph/homology";
import nonHomologySubgraph from "./src/subgraph/non-homology";

// dag 默认构图
// dagDefault();

// dag 条件构图
// dagCondition();

// 非持久化存储
// nonPersistent();

// 持久化存储
// persistent();

// human in loop
// humanInterrupt();

// 路径重放
// replay();

// function calling
// functionCalling();

// 同源子图
// homologySubgraph();

// 非同源子图
nonHomologySubgraph();
