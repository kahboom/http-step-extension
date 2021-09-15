import * as React from 'react';

const buttonStyling = {
  backgroundColor: 'crimson',
  color: 'white',
  borderRadius: '25px',
  border: 0,
  padding: '20px'
};

const Button = () => <button className={'superButton'} style={buttonStyling} onClick={() => console.log('BANANAS!')}>Best Button EVAR</button>;

export default Button;

