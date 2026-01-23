import React from 'react';
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
    unitPrice,
    itemsCount,
    isCartOpen,
    openCart,
    closeCart
  } = useCart();
  
  if (itemsCount === 0) return null;

  const handleCheckout = () => {
    // Generate secure message using Filenames
    const photoList = items.map((p) => {
        const refName = p.originalName || p.displayId || p.id.substring(0, 5).toUpperCase();
        const cleanRefName = refName.replace(/\.[^/.]+$/, "");
        const eventPrefix = p.eventName ? `[${p.eventName}] ` : '';
        return `✅ *${eventPrefix}${cleanRefName}*`;
    }).join('\n');
    
    const message = `Olá! Quero liberar minhas fotos em alta resolução da *Remaking Agency*.
    
*Minhas Escolhas:*
${photoList}

*Resumo:*
🖼️ ${itemsCount} fotos selecionadas
🏷️ Valor Unitário: R$ ${unitPrice.toFixed(2)}
💰 Valor Final: *R$ ${total.toFixed(2)}*
${discount > 0 ? `🔥 Economia de: R$ ${discount.toFixed(2)}` : ''}

Poderia me enviar a chave PIX?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  // Logic to show next tier
  const nextTierCount = itemsCount < 3 ? 3 : itemsCount < 6 ? 6 : null;
  const itemsNeeded = nextTierCount ? nextTierCount - itemsCount : 0;
  const nextPrice = itemsCount < 3 ? 'R$ 7,00' : 'R$ 5,00';

  return (
    <>
      {/* Floating Toggle Button - HIDDEN ON MOBILE */}
      <button
        onClick={openCart}
        className={`hidden md:flex fixed bottom-8 right-8 z-50 items-center bg-pickle text-brand-dark px-6 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all transform hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(204,255,0,0.7)] ${isCartOpen ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
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
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Drawer Content */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[61] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-dark text-white">
          <div>
            <h2 className="text-xl font-display font-bold uppercase tracking-wide flex items-center">
                <Camera className="w-5 h-5 mr-2 text-pickle" />
                Seus Registros
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Garanta suas memórias antes que expirem</p>
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Alert/Upsell Banner */}
        {itemsNeeded > 0 && (
            <div className="bg-gradient-to-r from-pickle/20 to-pickle/5 p-4 flex items-center gap-3 border-b border-pickle/10">
                <div className="bg-brand-dark p-2 rounded-full">
                    <AlertCircle className="w-4 h-4 text-pickle" />
                </div>
                <p className="text-xs text-brand-dark leading-tight">
                    Leve mais <span className="font-bold">{itemsNeeded} fotos</span> e pague apenas <span className="font-bold bg-pickle px-1 rounded">{nextPrice}</span> em cada foto!
                </p>
            </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {items.map((item) => {
            const rawName = item.originalName || item.displayId || item.id.substring(0, 5).toUpperCase();
            const displayName = rawName.replace(/\.[^/.]+$/, "");
            
            return (
                <div key={item.id} className="flex gap-4 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                                {displayName}
                            </span>
                            <span className="text-xs font-bold text-green-600">R$ {unitPrice.toFixed(2)}</span>
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
                 <span>Preço por Foto</span>
                 <span className="text-brand-dark bg-pickle px-2 py-0.5 rounded">Atual: R$ {unitPrice.toFixed(2)}</span>
              </div>
              
              {/* Custom Tier Bar */}
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner text-[8px] font-bold text-center leading-4 text-brand-dark/50 relative">
                 {/* Tier 1: 1-2 */}
                 <div className={`transition-all duration-500 border-r border-white/50 flex items-center justify-center ${itemsCount > 0 ? 'bg-gray-300 text-gray-700' : ''}`} style={{ width: '30%' }}>
                    R$ 12
                 </div>
                 {/* Tier 2: 3-5 */}
                 <div className={`transition-all duration-500 border-r border-white/50 flex items-center justify-center ${itemsCount >= 3 ? 'bg-pickle-300 text-brand-dark' : ''}`} style={{ width: '35%' }}>
                    R$ 7
                 </div>
                 {/* Tier 3: 6+ */}
                 <div className={`transition-all duration-500 flex items-center justify-center ${itemsCount >= 6 ? 'bg-pickle text-brand-dark' : ''}`} style={{ width: '35%' }}>
                    R$ 5 (Melhor)
                 </div>
              </div>
              
              <div className="flex justify-between text-[9px] text-gray-400 mt-1.5 font-medium uppercase tracking-wide">
                 <span>1-2 Fotos</span>
                 <span>3-5 Fotos</span>
                 <span>6+ Fotos</span>
              </div>
           </div>

           <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal (Sem Desconto)</span>
                <span className="line-through text-gray-400">R$ {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-pickle-700 font-bold bg-pickle/10 p-2 rounded-lg">
                    <span className="flex items-center"><Check className="w-3 h-3 mr-1" /> Economia de Pacote</span>
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