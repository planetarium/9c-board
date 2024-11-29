import { useRouter } from 'next/router';
import type { GetServerSideProps, NextPage } from 'next';
import Button from '@/components/Button';
import { getNetworkConfMapFromEnv } from '../utils/headlessGraphQLClient';

interface NetworkDefinition {
  name: string;
}

interface HomePageProps {
  networks: NetworkDefinition[];
}

const Home: NextPage<HomePageProps> = ({ networks }) => {
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
            <li key={network.name}>
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

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const networks = Array.from(getNetworkConfMapFromEnv().keys()).toSorted().map(name => {
    return {
      name,
    }
  });
  return {
    props: {
      networks,
    }
  }
}

export default Home;
