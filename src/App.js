import { Input } from 'antd';
import './App.css';
import { useForm } from "react-hook-form";
import { App as AppAntd } from 'antd';
import CashierApp from './components/CashierApp';

function App() {
    const { message, notification, modal } = AppAntd.useApp();

    return (
        <div className="flex bg-slate-50 min-h-screen w-full">
            <div className='w-full lg:w-1/2 mx-auto my-10 bg-slate-100 p-5 rounded-md'>
                <p className='font-bold text-lg text-center'>Simple Cashier App - Bambang M. Azhari</p>
                <CashierApp />
            </div>
        </div>
    );
}

export default App;
