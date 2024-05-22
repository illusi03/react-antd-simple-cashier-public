import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from "react-hook-form";
import { Button, Form, Input } from "antd";
import { FormItem } from "react-hook-form-antd";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Divider } from 'antd';
import { Select, InputNumber, App as AppAntd } from 'antd';
import { CloseOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { Table } from "antd";
import { Modal } from 'antd';

const ItemSchema = z.object({
    item_code: z
        .string()
        .min(1, { message: 'Required' }),
    item_name: z
        .string()
        .min(1, { message: 'Required' }),
    item_price: z
        .number()
        .min(1, { message: 'Required' }),
    item_qty: z
        .number()
        .min(1, { message: 'Required' }),
    item_total: z
        .number()
        .min(1, { message: 'Required' }),
});

const schema = z.object({
    // Top Form
    order_num: z
        .string()
        .min(1, { message: "Required" }),
    cashier_code: z
        .string()
        .min(1, { message: "Required" }),
    cashier_name: z
        .string()
        .min(1, { message: "Required" }),
    ordered_at: z
        .string()
        .min(1, { message: "Required" }),
    items: z
        .array(ItemSchema)
        .min(1, {
            message: `You need to add at least ${1} item`,
        })
        .max(10, {
            message: `You can add at most ${10} items`,
        }),
    // Bottom Form
    total: z
        .number()
        .nullable(),
    total_pay: z
        .number()
        .nullable(),
    total_return: z
        .number()
        .nullable(),
});

const products = [
    { value: 'PRD001', price: 10000, name: 'Produk 1' },
    { value: 'PRD002', price: 20000, name: 'Produk 2' },
    { value: 'PRD003', price: 30000, name: 'Produk 3' },
]

const cashiers = [
    { value: 'CSR001', name: 'Bambang M. Azhari' },
    { value: 'CSR002', name: 'Mohammad Azhari' },
    { value: 'CSR003', name: 'Azhari' },
]

const MainForm = () => {
    const { message, notification, modal } = AppAntd.useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const { control, handleSubmit, setValue, getValues } = useForm({
        defaultValues: {
            order_num: `ORDER-${uuidv4()}`,
            ordered_at: new Date().toLocaleTimeString(),
            items: [
                // { item_code: null, item_name: null, item_price: null, item_qty: null, item_total: null }
            ],
            total: null
        },
        resolver: zodResolver(schema)
    });

    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormProvider)
        name: "items", // unique name for your Field Array
    });

    const calcTotal = ({ totalPay, items }) => {
        // const totalPay = getValues('total_pay')
        // const items = getValues('items')
        let finalTotalItems = 0
        items.map((item) => {
            finalTotalItems += item.item_total
        })
        let totalReturn = totalPay - finalTotalItems
        if (isNaN(totalReturn)) {
            totalReturn = null
        }
        setValue('total', finalTotalItems)
        setValue('total_return', totalReturn)
    }

    const updateOrderedAt = () => {
        const dateString = new Date().toLocaleDateString('id');
        setValue('ordered_at', `${dateString}`)
    }

    useEffect(() => {
        updateOrderedAt()
    }, [])

    const TopForm = (
        <React.Fragment>
            <FormItem control={control} name="order_num" label="No. Faktur">
                <Input readOnly className='!bg-slate-200' />
            </FormItem>
            <FormItem control={control} name="cashier_code" label="Kode Kasir">
                <Select onChange={(value) => {
                    let cashier = _.find(cashiers, { value: value });
                    setValue('cashier_name', cashier.name)
                }}>
                    {cashiers.map((item, index) => {
                        return (
                            <Select.Option key={index} value={item.value}>({item.value}) {item.name}</Select.Option>
                        )
                    })}
                </Select>
            </FormItem>
            <FormItem control={control} name="cashier_name" label="Nama Kasir">
                <Input readOnly className='!bg-slate-200' />
            </FormItem>
            <FormItem control={control} name="ordered_at" label="Tanggal Order">
                <Input readOnly className='!bg-slate-200' />
            </FormItem>
        </React.Fragment>
    )

    const MidForm = (
        <div className='mb-10'>
            <Divider className='!mt-3 !mb-0' >
                <p>List Produk</p>
            </Divider>
            <div className='flex justify-end'>
                <Button type="primary" onClick={() => append()}>Tambah</Button>
            </div>
            {fields.map((fields, index) => {
                return (
                    <div className='flex gap-2' key={fields.id}>
                        <FormItem control={control} className="flex-1" name={`items.${index}.item_code`} label="Kode Barang">
                            <Select onChange={(value) => {
                                const product = _.find(products, { value: value });
                                setValue(`items.${index}.item_name`, product.name)
                                setValue(`items.${index}.item_price`, product.price)
                                setValue(`items.${index}.item_qty`, 1)
                                setValue(`items.${index}.item_total`, product.price)
                                calcTotal({ totalPay: getValues('total_pay'), items: getValues('items') })
                            }}>
                                {products.map((item, index) => {
                                    return (
                                        <Select.Option key={index} value={item.value}>({item.value}) {item.name}</Select.Option>
                                    )
                                })}
                            </Select>
                        </FormItem>
                        <FormItem control={control} name={`items.${index}.item_name`} label="Nama Barang">
                            <Input readOnly className='!bg-slate-200' />
                        </FormItem>
                        <FormItem control={control} className="!w-[100px]" name={`items.${index}.item_price`} label="Harga">
                            <InputNumber
                                readOnly
                                className='!bg-slate-200'
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </FormItem>
                        <FormItem control={control} className="!w-[50px]" name={`items.${index}.item_qty`} label="Qty.">
                            <InputNumber
                                min='0'
                                onChange={(value) => {
                                    const itemPrice = getValues(`items.${index}.item_price`)
                                    let itemTotal = itemPrice * value
                                    if (isNaN(itemTotal)) {
                                        itemTotal = null
                                    }
                                    setValue(`items.${index}.item_total`, itemTotal)
                                    calcTotal({ totalPay: getValues('total_pay'), items: getValues('items') })
                                }}
                                className="!w-[50px]"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </FormItem>
                        <FormItem control={control} className="!w-[100px]" readOnly name={`items.${index}.item_total`} label="Jumlah">
                            <InputNumber
                                readOnly
                                className=' !bg-slate-200'
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            />
                        </FormItem>
                        <div className='flex items-center mt-1'>
                            <Button disabled={index === 0} onClick={() => {
                                remove(index)
                                calcTotal({ totalPay: getValues('total_pay'), items: getValues('items') })
                            }} type="primary" danger icon={<CloseOutlined />} />
                        </div>
                    </div>
                )
            })}
        </div>
    )

    const BottomForm = (
        <div>
            <div className='flex'>
                <div className='flex justify-end mt-[-10px] mr-4 flex-1 font-bold'>
                    <p>Total</p>
                </div>
                <div className='w-1/2'>
                    <FormItem control={control} name="total">
                        <InputNumber
                            readOnly
                            className="!w-full !bg-slate-200"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                        />
                    </FormItem>
                </div>
            </div>
            <div className='flex'>
                <div className='flex justify-end mt-[-10px] mr-4 flex-1 font-bold'>
                    <p>Jumlah Bayar</p>
                </div>
                <div className='w-1/2'>
                    <FormItem control={control} name="total_pay">
                        <InputNumber
                            className="!w-full"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            onChange={(value) => {
                                calcTotal({ totalPay: value, items: getValues('items') })
                            }}
                        />
                    </FormItem>
                </div>
            </div>
            <div className='flex'>
                <div className='flex justify-end mt-[-10px] mr-4 flex-1 font-bold'>
                    <p>Kembali</p>
                </div>
                <div className='w-1/2'>
                    <FormItem control={control} name="total_return">
                        <InputNumber
                            readOnly
                            className="!w-full !bg-slate-200"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                            onChange={console.log}
                        />
                    </FormItem>
                </div>
            </div>
        </div>
    )

    const ResultModal = () => {
        const data = getValues();
        console.log(data)
        const dataSource = data?.items ?? []
        const columns = [
            {
                title: 'Name',
                dataIndex: 'item_name',
                key: 'item_name',
            },
            {
                title: 'Harga',
                dataIndex: 'item_price',
                key: 'item_price',
            },
            {
                title: 'Qty.',
                dataIndex: 'item_qty',
                key: 'item_qty',
            },
            {
                title: 'Qty.',
                dataIndex: 'item_total',
                key: 'item_total',
            }
        ]
        return (
            <Modal title="Result Data" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p>Nomor Faktur : {data?.order_num}</p>
                <p>Cashier : {data?.cashier_name} ({data?.cashier_code})</p>
                <p>Di Order Pada : {data?.ordered_at}</p>
                <Table size='small' dataSource={dataSource} columns={columns} rowKey={'item_code'} />
                <p>Total : {data?.total}</p>
                <p>Total Bayar : {data?.total_pay}</p>
                <p>Kembalian : {data?.total_return}</p>
            </Modal>
        )
    }

    return (
        <>
            <Form
                layout='vertical'
                onFinish={handleSubmit((data) => {
                    showModal(true)
                })}
            >
                {TopForm}
                {MidForm}
                {BottomForm}
                <div className='flex justify-end'>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Simpan
                        </Button>
                    </Form.Item>
                </div>
                <ResultModal />
            </Form>
        </>
    );
};

export default MainForm;
