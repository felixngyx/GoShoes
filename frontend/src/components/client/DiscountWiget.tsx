'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Percent, Copy, Check, Move, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Draggable from 'react-draggable'
import axiosClient from '../../apis/axiosClient'
import { useNavigate } from 'react-router-dom'

interface Discount {
    id: number
    code: string
    description: string
    valid_from: string
    valid_to: string
    percent: string
    products: any[]
    min_order_amount?: string
    usage_limit?: number
}

const DiscountChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLotteryChecked, setIsLotteryChecked] = useState(false)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [position, setPosition] = useState({ x: 20, y: 20 })
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [hoveredDiscountId, setHoveredDiscountId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedDiscounts, setExpandedDiscounts] = useState<number[]>([])
    const [userIP, setUserIP] = useState<string | null>(null)
    const [dropRate, setDropRate] = useState<number | null>(null)

    const nodeRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const lotteryResult = localStorage.getItem('lotteryResult');
        if (lotteryResult !== null) {
            setIsOpen(lotteryResult === 'true');
            setIsLotteryChecked(true);
        } else {
            const result = Math.random() < 0.5;
            localStorage.setItem('lotteryResult', result.toString());
            setIsOpen(result);
            setIsLotteryChecked(true);
            setDropRate(result ? 50 : 0); // Giả sử tỷ lệ là 50%
        }

        // Lấy địa chỉ IP của người dùng
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => setUserIP(data.ip))
            .catch(error => console.error('Error fetching IP:', error));
    }, []);

    useEffect(() => {
        const fetchDiscounts = async () => {
            try {
                setIsLoading(true)
                const response = await axiosClient.get('/randdis')
                console.log('Full API Response:', response)
                
                // More robust data extraction
                const data = response.data?.data?.discount || 
                             response.data?.discount || 
                             response.data || 
                             []
                
                console.log('Extracted Discounts:', data)
                
                if (data.length === 0) {
                    setError('No discounts found')
                } else {
                    setDiscounts(data)
                }
            } catch (error) {
                console.error('Error fetching discounts:', error)
                setError('Failed to fetch discounts')
                setDiscounts([])
                toast.error('Could not load discounts')
            } finally {
                setIsLoading(false)
            }
        }

        fetchDiscounts()
    }, [])

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code)
            toast.success('Discount code copied!')
        }).catch(err => {
            console.error('Failed to copy: ', err)
            toast.error('Failed to copy code.')
        })

        // Reset copied state after 2 seconds
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const handleDragStart = () => {
        setIsDragging(true)
    }

    const handleDragStop = () => {
        setIsDragging(false)
    }

    const handleDrag = (e: any, ui: any) => {
        const { x, y } = ui;
        const newX = Math.max(0, Math.min(x, window.innerWidth - 320));
        const newY = Math.max(0, Math.min(y, window.innerHeight - 100));
        setPosition({ x: newX, y: newY });
    };

    useEffect(() => {
        const handleResize = () => {
            setPosition(prevPosition => ({
                x: Math.min(prevPosition.x, window.innerWidth - 320),
                y: Math.min(prevPosition.y, window.innerHeight - 100)
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleProductList = (discountId: number) => {
        setExpandedDiscounts(prev => 
            prev.includes(discountId) 
                ? prev.filter(id => id !== discountId)
                : [...prev, discountId]
        )
    }

    const renderDiscountContent = () => {
        if (isLoading) {
            return (
                <div className="text-center py-4 text-gray-500">
                    Loading discount codes...
                </div>
            )
        }

        if (error) {
            return (
                <div className="flex items-center justify-center text-red-500 py-4">
                    <AlertCircle className="mr-2" />
                    {error}
                </div>
            )
        }

        if (discounts.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500">
                    No discount codes available
                </div>
            )
        }

        return discounts.map((discount) => (
            <motion.div
                key={discount.id}
                onMouseEnter={() => setHoveredDiscountId(discount.id)}
                onMouseLeave={() => setHoveredDiscountId(null)}
                className={`
                    p-3 rounded-lg transition-all duration-300
                    ${hoveredDiscountId === discount.id 
                        ? 'bg-blue-50 shadow-md' 
                        : 'bg-gray-100'}
                `}
            >
                <p className="font-medium mb-2">{discount.description}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <code 
                            className="bg-gray-200 px-2 py-1 rounded mr-2 text-sm"
                        >
                            {discount.code}
                        </code>
                        <span className="text-sm text-gray-600">
                            {discount.percent}% OFF
                        </span>
                    </div>
                    <button
                        onClick={() => handleCopy(discount.code)}
                        className={`
                            transition-all duration-300
                            ${hoveredDiscountId === discount.id 
                                ? 'text-blue-700 scale-110' 
                                : 'text-blue-500'}
                            hover:text-blue-700 hover:scale-110
                        `}
                        aria-label={`Copy code ${discount.code}`}
                    >
                        {copiedCode === discount.code 
                            ? <Check size={20} color="green" /> 
                            : <Copy size={20} />}
                    </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Valid from: {new Date(discount.valid_from).toLocaleDateString()}
                    {' '} to {' '}
                    {new Date(discount.valid_to).toLocaleDateString()}
                </div>
                {discount.products && discount.products.length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                        <button 
                            onClick={() => toggleProductList(discount.id)}
                            className="flex items-center gap-1 font-medium hover:text-blue-600 transition-colors"
                        >
                            {expandedDiscounts.includes(discount.id) ? (
                                <>
                                    <ChevronUp size={16} />
                                    Hide products
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={16} />
                                    Show products ({discount.products.length})
                                </>
                            )}
                        </button>
                        
                        {expandedDiscounts.includes(discount.id) && (
                            <motion.ul 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-2 space-y-1"
                            >
                                {discount.products.map((product) => (
                                    <li 
                                        key={product.id} 
                                        className="ml-2 cursor-pointer text-blue-600 hover:underline"
                                        onClick={() => navigate(`/products/${product.id}`)}
                                    >
                                        • {product.name}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </div>
                )}
            </motion.div>
        ))
    }

    if (!isLotteryChecked) {
        return null;
    }

    return (
        <Draggable
            handle=".drag-handle"
            nodeRef={nodeRef}
            position={position}
            onStart={handleDragStart}
            onStop={handleDragStop}
            onDrag={handleDrag}
        >
            <div 
                ref={nodeRef} 
                className="fixed mt-10 w-[320px] z-50"
                style={{
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    cursor: isOpen ? 'move' : 'pointer'
                }}
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                            className="bg-white rounded-lg shadow-lg p-4 mb-4 w-80"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Discount Codes</h2>
                                <div 
                                    className="drag-handle cursor-move" 
                                    title="Move widget"
                                >
                                    <Move size={20} />
                                </div>
                            </div>
                            
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                                {renderDiscountContent()}
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                <p>Drop Rate: {dropRate}%</p>
                                <p>Your IP: {userIP}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                        rotate: isOpen ? 180 : 0 
                    }}
                    transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                    }}
                    onClick={() => !isDragging && setIsOpen(!isOpen)}
                    className={`
                        bg-blue-500 text-white p-3 rounded-full shadow-lg 
                        transition-all duration-300
                        ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
                        hover:bg-blue-600 active:bg-blue-700
                    `}
                    aria-label="Toggle discount widget"
                >
                    <Percent size={24} />
                </motion.button>
            </div>
        </Draggable>
    )
}

export default DiscountChatWidget