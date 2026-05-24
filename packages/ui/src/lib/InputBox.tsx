import { InputHTMLAttributes } from 'react';

export interface InputBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  type?: string;
}

export function InputBox({ className = '', error, type, ...props }: InputBoxProps) {
  return (
    <div className="">
      <input className={`base-input ${className} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} type={type || 'text'} {...props} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default InputBox;
