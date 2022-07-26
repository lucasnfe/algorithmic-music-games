class World {
    constructor(grid, cellSize) {
      // Create grid
      this.grid = grid;
      this.cellSize = cellSize;
    }

    // A state here is a vector
    adj(state, isSolid = false) {
      let adjStates = [];

      let top = createVector(state.x, state.y - 1);
      if(this.isSolid(top.x, top.y) == isSolid) {
          adjStates.push(top);
      }

      let right = createVector(state.x + 1, state.y);
      if(this.isSolid(right.x, right.y) == isSolid) {
          adjStates.push(right);
      }

      let bottom = createVector(state.x, state.y + 1);
      if(this.isSolid(bottom.x, bottom.y) == isSolid) {
          adjStates.push(bottom);
      }

      let left = createVector(state.x - 1, state.y);
      if(this.isSolid(left.x, left.y) == isSolid) {
          adjStates.push(left);
      }

      return adjStates;
    }

    set(x, y) {
      this.grid[x][y] = 1;
    }

    isSolid(x, y) {
      if(x >= 0 && x < this.grid.length &&
         y >= 0 && x < this.grid[x].length) {
        return this.grid[x][y] == 1;
      }

      return false;
    }

    isSearchCell(x, y) {
      if(x >= 0 && x < this.grid.length &&
         y >= 0 && x < this.grid[x].length) {
        return this.grid[x][y] == 7;
      }

      return false;
    }

    draw() {
      for(let x = 0; x < this.grid.length; x++) {
          for(let y = 0; y < this.grid[x].length; y++) {
              if(this.grid[x][y] == 1) {
                  noStroke();
                  fill(50);
              } else {
                  stroke(30);
                  fill(20);
              }

              rect(y * this.cellSize, x * this.cellSize, this.cellSize, this.cellSize);
          }
      }
    }

    bfs(init, goal) {
        let queue = [init];
        let visited = {init: null};

        while(queue.length > 0) {
            // Apply BFS strategy to expand node
            let cnode = queue.shift();

            // Check if cnode is the goal
            if (this.isGoalState(cnode, goal)) {
                return this.pathToGoal(init, cnode, visited);
            }

            // Iterate on the list of adjacent nodes
            for (let cnext of this.adj(cnode)) {
                if(!(cnext in visited)) {
                    visited[cnext] = cnode;
                    queue.push(cnext);
                }
            }
        }

        return null;
    }

    a_star(init, goal) {
        var pQueue = new PriorityQueue();
        pQueue.enqueue(init, 0);

        let visited = {init: null};
        let costSoFar = {init: 0};

        while(!pQueue.isEmpty()) {
            // Apply BFS strategy to expand node
            let cnode = pQueue.dequeue().element;

            // Check if cnode is the goal
            if (this.isGoalState(cnode, goal)) {
                return this.pathToGoal(init, cnode, visited);
            }

            // Iterate on the list of adjacent nodes
            for (let cnext of this.adj(cnode)) {
                let newCost = costSoFar[cnode] + this.cost(cnode, cnext);

                if(!(cnext in visited) || newCost < costSoFar[cnext]) {
                    costSoFar[cnext] = newCost;
                    let priority = newCost + this.manhatan(goal, cnext);
                    pQueue.enqueue(cnext, priority);
                    visited[cnext] = cnode;
                }
            }
        }

        return null;
    }

    isGoalState(state, goal) {
      return (state.x == goal.x) && (state.y == goal.y);
    }

    cost(stateA, stateB) {
      return 1;
    }

    diagonal(state, goal) {
      let dx = abs(state.x - goal.x)
      let dy = abs(state.y - goal.y)
      return (dx + dy) + -1 * min(dx, dy)
    }

    manhatan(state, goal) {
      let dx = abs(state.x - goal.x)
      let dy = abs(state.y - goal.y)
      return (dx + dy)
    }

    pathToGoal(init, goal, visited) {
        let path = [];

        let n = goal;
        while(n != init) {
            path.push(n);
            n = visited[n];
        }

        return path.reverse();
    }

    pos2Coord(pos) {
      let x = int(pos.y/this.cellSize);
      let y = int(pos.x/this.cellSize);
      return createVector(x, y);
    }

    coord2Pos(coord) {
      let x = (coord.y*this.cellSize);
      let y = (coord.x*this.cellSize);
      return createVector(x, y);
    }

    cell2Pos(coord) {
      let x = (coord.y*this.cellSize) + this.cellSize/2;
      let y = (coord.x*this.cellSize) + this.cellSize/2;
      return createVector(x, y);
    }

    getRandomCoord() {
      let emptyCells = [];

      for(let x = 0; x < this.grid.length; x++) {
        for(let y = 0; y < this.grid[x].length; y++) {
            if(this.isSearchCell(x, y)) {
              emptyCells.push(createVector(x, y));
            }
        }
      }

      let i = int(random(0, emptyCells.length));
      return emptyCells[i];
    }
}
