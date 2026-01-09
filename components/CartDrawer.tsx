import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, Check, ChevronRight, AlertCircle, Camera, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const WHATSAPP_NUMBER = "5531993430851";

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    removeItem, 
    subtotal, 
    discount, 
    total, 
    discountPercent, 
    itemsCount 
  } = useCart();
  
  const [isOpen, setIsOpen] = useState(false);

  if (itemsCount === 0) return null;

  const handleCheckout = () => {
    // Generate secure message using Short IDs
    const photoList = items.map((p) => {
        const shortId = p.displayId || p.id.substring(0, 5).toUpperCase();
        return `✅ *#${shortId}*`;
    }).join('\n');
    
    const message = `Olá! Quero liberar minhas fotos em alta resolução da *Remaking Agency*.
    
*Minhas Escolhas:*
${photoList}

*Resumo:*
🖼️ ${itemsCount} fotos selecionadas
💰 Valor Final: *R$ ${total.toFixed(2)}*
${discount > 0 ? `🔥 Economia de: R$ ${discount.toFixed(2)}` : ''}

Poderia me enviar a chave PIX?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 flex items-center bg-pickle text-brand-dark px-6 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all transform hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(204,255,0,0.7)] ${isOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      >
        <div className="relative">
            <ShoppingCart className="w-5 h-5 mr-3" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <span className="mr-2 uppercase tracking-wide text-xs">Finalizar Compra</span>
        <span className="bg-brand-dark text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-mono">
          {itemsCount}
        </span>
      </button>

      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Content */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[51] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-dark text-white">
          <div>
            <h2 className="text-xl font-display font-bold uppercase tracking-wide flex items-center">
                <Camera className="w-5 h-5 mr-2 text-pickle" />
                Seus Registros
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Garanta suas memórias antes que expirem</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Alert/Upsell Banner */}
        {itemsCount < 3 && (
            <div className="bg-orange-50 p-3 flex items-start gap-3 border-b border-orange-100">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-xs text-orange-800 leading-tight">
                    <span className="font-bold">Dica:</span> Adicione mais <span className="font-bold">{3 - itemsCount} fotos</span> para ganhar <span className="font-bold">10% de desconto</span> imediato!
                </p>
            </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {items.map((item) => {
            const shortId = item.displayId || item.id.substring(0, 5).toUpperCase();
            return (
                <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">REF: {shortId}</span>
                            <span className="text-xs font-bold text-green-600">R$ 10,00</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-1 mt-1">{item.caption || 'Pickleball Action'}</h4>
                    </div>
                    <div className="flex justify-end items-end">
                        <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 text-[10px] font-bold uppercase flex items-center hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                        <Trash2 className="w-3 h-3 mr-1" /> Remover
                        </button>
                    </div>
                </div>
                </div>
            );
          })}
        </div>

        {/* Footer & Checkout */}
        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           {/* Progressive Discount Bar */}
           <div className="mb-6">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase mb-2">
                 <span>Nível de Desconto</span>
                 <span className="text-pickle-600 bg-pickle/10 px-2 py-0.5 rounded">{discountPercent * 100}% OFF</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                 <div className={`h-full transition-all duration-500 border-r border-white/50 ${itemsCount >= 3 ? 'bg-yellow-400' : 'bg-gray-200'}`} style={{ width: '33%' }} title="3+ Fotos" />
                 <div className={`h-full transition-all duration-500 border-r border-white/50 ${itemsCount >= 6 ? 'bg-orange-400' : 'bg-gray-200'}`} style={{ width: '33%' }} title="6+ Fotos" />
                 <div className={`h-full transition-all duration-500 ${itemsCount > 10 ? 'bg-green-500' : 'bg-gray-200'}`} style={{ width: '34%' }} title="10+ Fotos" />
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 mt-1.5 font-medium uppercase tracking-wide">
                 <span className={itemsCount >= 3 ? 'text-yellow-600 font-bold' : ''}>Bronze (10%)</span>
                 <span className={itemsCount >= 6 ? 'text-orange-600 font-bold' : ''}>Prata (20%)</span>
                 <span className={itemsCount > 10 ? 'text-green-600 font-bold' : ''}>Ouro (30%)</span>
              </div>
           </div>

           <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({itemsCount} itens)</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-pickle-700 font-bold bg-pickle/10 p-2 rounded-lg">
                    <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Desconto Aplicado</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t border-gray-100">
                 <span>Total</span>
                 <span>R$ {total.toFixed(2)}</span>
              </div>
           </div>

           <button 
             onClick={handleCheckout}
             className="w-full bg-[#25D366] hover:bg-[#128c7e] text-white py-4 px-6 rounded-xl font-bold uppercase tracking-wider transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-1 active:scale-[0.98] flex justify-between items-center group"
           >
             <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-full">
                    <MessageCircle className="w-6 h-6 fill-white stroke-none" />
                 </div>
                 <div className="flex flex-col items-start text-left">
                     <span className="text-[10px] font-medium opacity-90">Enviar pedido via WhatsApp</span>
                     <span className="text-sm md:text-base font-black leading-none mt-0.5">Baixar Fotos em Alta</span>
                 </div>
             </div>
             <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
           <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center">
             <Check className="w-3 h-3 mr-1 text-green-500" /> Entrega imediata após confirmação PIX
           </p>
        </div>
      </div>
    </>
  );
};