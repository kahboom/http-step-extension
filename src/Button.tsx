import * as React from 'react';

const buttonStyling = {
  // backgroundColor: 'crimson',
  backgroundColor: 'BlueViolet',
  color: 'white',
  borderRadius: '25px',
  border: 0,
  padding: '20px'
};

export type Props = {
  onButtonClicked?: () => void;
}

const Button = (props: Props) => {
  //() => console.log('BANANAS!')
  return (
    <button className={'superButton'} style={buttonStyling} onClick={props.onButtonClicked}>Best Button EVAR</button>
  )
};

export default Button;

