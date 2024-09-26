import { useDrag } from 'react-dnd';
type PatternSwatchProps = {
    pattern: string;
};

const PatternSwatch = ({ pattern }: PatternSwatchProps) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'pattern',
        item: { pattern },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`w-12 h-12 border border-gray-300 cursor-move bg-cover bg-center ${isDragging ? 'opacity-50' : ''}`}
            style={{ backgroundImage: `url(${pattern})` }}
        />
    );
};

export default PatternSwatch;