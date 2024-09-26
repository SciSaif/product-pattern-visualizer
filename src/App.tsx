import { useState } from 'react';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductCustomizer from "./components/ProductCustomizer";

function App() {
  const products = [
    { id: 1, type: 'Wallet', image: 'products/wallet1.png' },
    { id: 2, type: 'Wallet', image: 'products/wallet2.png' },
    { id: 3, type: 'Wallet', image: 'products/wallet3.png' },
    { id: 21, type: 'Shirt', image: 'products/shirt1.png' },
    { id: 31, type: 'Bag', image: 'products/bag1.webp' },
    { id: 32, type: 'Bag', image: 'products/bag2.webp' },
    { id: 33, type: 'Bag', image: 'products/bag3.webp' },
    { id: 34, type: 'Bag', image: 'products/bag5.png' },
  ];

  const patterns = [
    'patterns/pattern1.webp',
    'patterns/pattern3.png',
    'patterns/pattern4.png',
  ];

  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  const handleProductSelect = (product: { id: number, type: string, image: string }) => {
    setSelectedProduct(product);
  };

  return (
    <div className="light">
      <DndProvider backend={HTML5Backend}>
        <div className="App">
          <h1>Product Customizer</h1>

          {/* Product Selection */}
          <div className="product-list">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className={product.id === selectedProduct.id ? 'selected' : ''}
              >
                <img src={product.image} alt={product.type} width={100} height={100} />
              </button>
            ))}
          </div>

          {/* Pass the selected product to ProductCustomizer */}
          <ProductCustomizer productImage={selectedProduct.image} patterns={patterns} />
        </div>
      </DndProvider>
    </div>
  );
}

export default App;