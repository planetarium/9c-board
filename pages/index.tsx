import Router, { useRouter } from 'next/router';
import type { NextPage } from 'next';

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

const networks = [
  {
    id: 0,
    name: 'odin',
  },
  {
    id: 1,
    name: 'odin-internal',
  },
  {
    id: 2,
    name: 'heimdall',
  },
  {
    id: 3,
    name: 'heimdall-internal',
  },
];

const Home: NextPage = () => {
  const router = useRouter();

  const handleClick = (networkName: string) => {
    router.push(`/${networkName}`);
  };

  return (
    <div className='flex justify-center align-items h-screen'>
      <div className='m-auto'>
        <h1 className='font-extrabold text-3xl py-5'>Available networks</h1>
        <ul className='text-center'>
          {networks.map((network) => (
            <li key={network.id}>
              <Button handleClick={() => handleClick(network.name)}>
                {network.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
