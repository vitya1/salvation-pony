const PONY = 'p';
const END = 'e';
const WALL = 'x';

export class PathFinder {

    /**
     * Finds the best next step direction
     * @param {Object} data 
     */
    getNextStepDirection(data) {
        let modified_maze_path = this.wave(this.createMazeFromSource(data))
        let path = this.getSourceMazePath(modified_maze_path);

        if(path.length < 2) {
            return null;
        }
        let cur_point = path[path.length - 1];
        let next_point = path[path.length - 2];

        if(next_point[0] < cur_point[0]) {
            return 'north';
        }
        if(next_point[0] > cur_point[0]) {
            return 'south';
        }
        if(next_point[1] < cur_point[1]) {
            return 'west';
        }
        if(next_point[1] > cur_point[1]) {
            return 'east';
        }
        return null;
    }

    /**
     * Path finding wave algorithm. Read more about https://en.wikipedia.org/wiki/Lee_algorithm
     * @param {Array} maze Two dimensional array displays maze view from above.
     * @returns {Arrays} path points
     */
    wave(maze) {
        let wavefront = [];
        let pony = [];
        let finish = [];
        for(let i = 0; i < maze.length; i++) {
            if(maze[i].indexOf(PONY) !== -1) {
                pony = [i, maze[i].indexOf(PONY)];
            }
            if(maze[i].indexOf(END) !== -1) {
                finish = [i, maze[i].indexOf(END)];
            }
        }
        if(pony.length === 0 || finish.length === 0) {
            return [];
        }

        //Wave propagation stage
        const chechWavePointAvailability = function(x, y) {
            return maze[x] !== undefined && maze[x][y] !== undefined
                && maze[x][y] !== WALL && maze[x][y] !== PONY && maze[x][y] === 0;
        }
        wavefront.push(pony);
        while(wavefront.length > 0) {
            let w = wavefront.shift();
            let point_value = (maze[w[0]][w[1]] === PONY ? 0 : +maze[w[0]][w[1]]) + 1;
            let neighbor_points = [[w[0] + 1, w[1]], [w[0], w[1] + 1], [w[0] - 1, w[1]], [w[0], w[1] - 1]];

            for(let point of neighbor_points) {
                if(chechWavePointAvailability(point[0], point[1])) {
                    maze[point[0]][point[1]] = point_value;
                    wavefront.push(point);
                }
            }
        }

        //Return stage
        const chechPathPointAvailability = function(x, y) {
            return maze[x] === undefined || maze[x][y] === undefined
                || maze[x][y] === 0 || maze[x][y] === WALL || maze[x][y] === END;
        }
        let path = [finish];
        let is_pony_reached = false;
        while(!is_pony_reached) {
            let p = path[path.length - 1];
            let neighbor_points = [[p[0] + 1, p[1]], [p[0], p[1] + 1], [p[0] - 1, p[1]], [p[0], p[1] - 1]];
            let next_point = null;
            for(let point of neighbor_points) {
                if(chechPathPointAvailability(point[0], point[1])) {
                    continue;
                }
                if(maze[point[0]][point[1]] === PONY) {
                    path.push(point);
                    is_pony_reached = true;
                    break;
                }
                
                if(next_point === null || maze[point[0]][point[1]] < maze[next_point[0]][next_point[1]]) {
                    next_point = point;
                }
            }
            if(is_pony_reached || next_point === null) {
                break;
            }
            path.push(next_point);
        }

        return path;
    }

    /**
     * Converts raw api data into two dimensional array. Its necessary for the path finder algorithm.
     * @param {Object} data Api responce data
     * @returns {Array}
     */
    createMazeFromSource(data) {
        const maze = [];
        let walls = [];
        let tunnels = [];
        for(let i = 0; i < data.data.length; i++) {
            if(i % data.size[1] === 0) {
                walls = [];
                tunnels = [];
            }

            let val = 0;
            if(data['pony'][0] === i) {
                val = PONY;
            }
            else if(data['domokun'][0] === i) {
                val = WALL;
            }
            else if(data['end-point'][0] === i) {
                val = END;
            }

            if(data.data[i].length === 2) {
                walls.push(WALL, WALL);
                tunnels.push(WALL, val);
            }
            else if(data.data[i][0] === 'north') {
                walls.push(WALL, WALL);
                tunnels.push(0, val);
            }
            else if(data.data[i][0] === 'west') {
                walls.push(WALL, 0);
                tunnels.push(WALL, val);
            }
            else {
                walls.push(0, 0);
                tunnels.push(0, val);
            }
            if(i % data.size[1] === 0) {
                maze.push(walls, tunnels);
            }

        }

        return maze;
    }

    /**
     * Converts found path to the source maze path.
     * Its necessary in case the raw api data were transformed into the new 2-dimensional array,
     * which means the path was found in this 2-dimensional array not in the source maze
     * @param {Array} path
     * @returns {Array}
     */
    getSourceMazePath(path) {
        let maze_path = [];
        path.map(point => point.map(coord => Math.floor(coord / 2)))
            .forEach(point => {
                let i = maze_path.length - 1;
                if(maze_path.length === 0 || point[0] !== maze_path[i][0] || point[1] !== maze_path[i][1]) {
                    maze_path.push(point);
                }
        });
        return maze_path;
    }

}
