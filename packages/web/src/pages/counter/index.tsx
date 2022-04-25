import React, { FC, useState } from 'react';
import PrimaryButton from '~/components/buttons/PrimaryButton';
import Style from './counter.module.scss';

interface Props {
  address: string
}

const Counter: FC<Props> = ({ address }) => {
  const [amount, setAmount] = useState(0);
  const handleOnIncrementClick = () => {};
  return (
    <section className="simple-container">
      <h1>Counter</h1>
      <div>
        <p>Value: 0</p>
          <label className={Style.labelAmount}>
            Increment amount:
            <input className={Style.inputAmount} type="number" min="1" value={amount} onChange={() => {}} />
          </label>
        <PrimaryButton 
          loading={false} 
          onClick={handleOnIncrementClick}
        >
          Increment
        </PrimaryButton>
      </div>
    </section>
  );
};

export default Counter;
