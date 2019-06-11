import React, { Component }  from 'react';
import { Grid } from 'semantic-ui-react';
import { Input } from 'semantic-ui-react';
import { Header } from 'semantic-ui-react';

export class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input_hash: '',
        };
        this.pasteMazeButtonHandler = this.pasteMazeButtonHandler.bind(this);
    }

    pasteMazeButtonHandler(e) {
        const hash_length = 36;
        const hash_value = e.target.value;

        this.setState({input_hash: hash_value});
        if(
            hash_value.length === hash_length
             && !RegExp('[^a-z0-9-]', 'g').test(hash_value)
        ) {
            this.props.history.push('/' + hash_value);
        }
    }

    render() {
        return (
        <div>
            <Grid verticalAlign='middle' centered textAlign='center'>
                <Grid.Row className='welcome_content'>
                    <Grid.Column>
                        <Header as='h1' color='yellow' textAlign='center'>Salvation Pony</Header>
                        <br></br>
                        <Input fluid size='massive' icon='search' value={this.state.input_hash}
                        onChange={this.pasteMazeButtonHandler} placeholder='paste maze id here...' />
                        <p>
                            <b>
                                <a target='_blank' href='https://github.com/vitya1/salvation-pony'>Self github link</a> | 
                                <a target='_blank' href='https://ponychallenge.trustpilot.com/api-docs/index.html'>Get maze id</a>
                            </b>
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
        );
    }
}

