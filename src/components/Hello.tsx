import React,{
    Component,
    ReactNode,
    ComponentType,
    MouseEvent,
    SFC
} from 'react';
import Button from './button';

export interface Props { compiler: string; framework: string; };

const initialState = { clicksCount: 0 };
type State = Readonly<typeof initialState>;

class ButtonCounter extends Component<object, State> {
    readonly state: State = initialState;

    render() {
        const { clicksCount } = this.state;
        return (
            <>
            <Button onClick={this.handleClick.bind(null,'Increment')}>Increment</Button>
            <Button onClick={this.handleClick.bind(null,'Decrement')}>Decrement</Button>
            You've clicked me {clicksCount} times!
            </>
        );
    }

    private handleClick = (type: string) => this.setState({
        clicksCount: this.state.clicksCount + (type === 'Increment' ? 1 : -1) ,
    })

}

export class Hello extends Component<Props, {}> {
    render() {
        let render = (
            <div>
                <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>
                <Button onClick={() => {return}}>你好</Button>
                <ButtonCounter/>
            </div>
        )
        return render
    }
}
