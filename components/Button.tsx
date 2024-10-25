interface ButtonProps {
  children: string;
  handleClick: () => void;
}

const Button = ({ children, handleClick }: ButtonProps) => {
  return (
    <button
      type='button'
      className='border font-semibold text-lg m-1 py-1 w-full bg-white rounded-md  hover:bg-gray-200 transition duration-200'
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;
