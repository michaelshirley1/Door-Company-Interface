import { Routes, Route } from 'react-router-dom';
import Layout from './layout/layout';

export default function App() {
  return (
    <Layout>
        <Routes>
            {/* <Route path="/" element={<Home />} />
            <Route path="/friends" element={<Friends />} /> */}
        </Routes>
    </Layout>
  );
}