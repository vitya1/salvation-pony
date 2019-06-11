import React, { Component }  from 'react';
import { Link } from 'react-router-dom';
import { Grid } from 'semantic-ui-react';
import { Segment } from 'semantic-ui-react';
import { Sticky } from 'semantic-ui-react';
import { Table } from 'semantic-ui-react';
import { Button } from 'semantic-ui-react';
import { Modal } from 'semantic-ui-react';
import { Image } from 'semantic-ui-react';
import { Icon } from 'semantic-ui-react';
import { PathFinder } from '../lib/PathFinder';
import SoundWin from '../sounds/impressive.wav';
import SoundLoose from '../sounds/sudden_death.wav';
import RainbowImg from '../images/rainbow.png';
import RainbowBWImg from '../images/rainbow_bw.png';


export class Game extends Component {
    constructor(props) {
        super(props);

        let maze_id = '';
        try {
            maze_id = props.match.params.id
        }
        catch(e) {
            console.warn(e);
        }
        this.base_url = 'https://ponychallenge.trustpilot.com';
        this.state_url = this.base_url + '/pony-challenge/maze/' + maze_id;
        this.print_url = this.base_url + '/pony-challenge/maze/' + maze_id + '/print';
        this.move_url = this.base_url + '/pony-challenge/maze/' + maze_id;

        this.state = {
            maze_id: maze_id,
            maze_print: 'prepare for battle',
            difficulty: '',
            maze: {},
            finish_message: '',
            finish_pic: '',
            move_disabled: false,
            move_cnt: 0,
        };

        this.moveButtonHandler = this.moveButtonHandler.bind(this);
        this.reloadMaze();
    }

    async reloadMaze() {
        try {

            const [print_res, state_res] = await Promise.all([
                fetch(this.print_url, {mode: 'cors'}), fetch(this.state_url, {mode: 'cors'})
            ]);
            if(!print_res.ok || !state_res.ok) {
                this.setState({maze_print: 'Something wrong happened. Try to reload page later'});
            }

            this.setState({maze_print: await print_res.text()});
            let data = await state_res.json();
 
            if(
                !this.state.finish_message && this.state.move_cnt > 0
                 && ['over', 'won'].indexOf(data['game-state']['state']) !== -1
            ) {
               (new Audio(data['game-state']['state'] === 'over' ? SoundLoose : SoundWin)).play();
               this.setState({
                   finish_message: data['game-state']['state-result'],
                   finish_pic: data['game-state']['hidden-url']
               });
           }
           this.setState({maze: data, difficulty: data.difficulty});

        }
        catch(e) {
            console.error(e);
        }
    }

    async moveButtonHandler() {
        this.setState({move_disabled: true, move_cnt: this.state.move_cnt + 1});

        const finder = new PathFinder();
        let direction = finder.getNextStepDirection(this.state.maze);
        if(direction == null) {
            direction = 'south';
        }

        try {
            const options = {
                body: JSON.stringify({'direction': direction}),
                headers: {'Content-Type': 'application/json'},
                mode: 'cors',
                method: 'post',
            };
            const res = await fetch(this.move_url, options);
            if(res.ok) {
                this.reloadMaze();
            }
            this.setState({move_disabled: false});
        }
        catch(e) {
            console.error(e);
        }
    }

    getDifficulty() {
        const max_difficulty = 10;
        let difficulty = [];
        for(let i = 0; i < max_difficulty; i++) {
            let src = i < this.state.difficulty ? RainbowImg : RainbowBWImg;
            difficulty.push(
                <img key={i} src={src} alt=''></img>
            );
        }
        return difficulty;
    }

    render() {

        return (
        <div>
            <Modal open={!!this.state.finish_message}>
                <Modal.Content image>
                    <Image wrapped size='large' src={this.base_url + this.state.finish_pic} />
                    <Modal.Description>
                        <p className='finish_message'>{this.state.finish_message}</p>
                        <Link to='/'>Start new game</Link>
                    </Modal.Description>
                </Modal.Content>
            </Modal>
            <Segment basic>

                <Grid className='playground'>
                    <Grid.Row>

                        <Grid.Column  textAlign='center' verticalAlign='middle'>
                            <Sticky>
                            <Segment>

                            <Table basic='very'>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>
                                        <Button color='pink'
                                         disabled={this.state.move_disabled}
                                         onClick={this.moveButtonHandler}>
                                            <Icon name='rocket'></Icon>Make a move
                                        </Button>
                                    </Table.Cell>
                                    <Table.Cell><b>Difficulty</b></Table.Cell>
                                    <Table.Cell className='difficulty'>{this.getDifficulty()}</Table.Cell>
                                    <Table.Cell><b>Maze ID</b></Table.Cell>
                                    <Table.Cell>{this.state.maze_id}</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                            </Table>

                            </Segment>
                            </Sticky>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column textAlign='center' verticalAlign='middle'>
                            <pre>{this.state.maze_print}</pre>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </div>
        );
    }
}
