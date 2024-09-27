import { useState } from 'react';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductCustomizer from "./components/ProductCustomizer";
import { Card } from './components/ui/card';
import { twMerge } from 'tailwind-merge';
import { products } from './data/products';
import { patterns } from './data/patterns';

function App() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  const handleProductSelect = (product: { id: number, type: string, image: string }) => {
    setSelectedProduct(product);
  };

  return (
    <div className="py-6 light">
      <DndProvider backend={HTML5Backend}>
        <div className="App">


          <h1 className='px-4 pb-2 text-xl font-semibold sm:text-lg'>Select a product</h1>
          <div className="flex flex-row flex-wrap justify-center gap-2 px-4 pb-4 border-b shadow sm:justify-start">
            {products.map(product => (
              <Card key={product.id} className={twMerge('p-2 w-fit max-w-[150px] min-w-[80px] flex justify-center items-center hover:shadow-xl hover:scale-105',

                product.id === selectedProduct.id ? 'bg-gray-100 border-slate-400' : 'bg-white'
              )}>
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={product.id === selectedProduct.id ? 'selected' : ''}
                >
                  <img src={product.image} alt={product.type} width={100} height={100} />
                </button>
              </Card>
            ))}
          </div>

          <ProductCustomizer productImage={selectedProduct.image} patterns={patterns} />
        </div>
      </DndProvider>
    </div>
  );
}

export default App;