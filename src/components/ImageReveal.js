import React, { useState, useEffect, useRef } from 'react';
import { decompressText } from './TextInput';
import './ImageReveal.css';

function ImageReveal({ text }) {
    const [revealedBoxes, setRevealedBoxes] = useState([]);
    const [showInstruction, setShowInstruction] = useState(true);
    const imgRef = useRef(null);

    const toggleBox = (index) => {
        if(revealedBoxes.includes(index)) {
            setRevealedBoxes(prev => prev.filter(i => i !== index));
        } else {
            setRevealedBoxes(prev => [...prev, index]);
        }
    }

    const imgSrc = decompressText(text);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowInstruction(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="image-reveal-container">
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <img ref={imgRef} src={imgSrc} className="image-reveal-image" alt="Reveal" />
                {[...Array(25)].map((_, index) => (
                    !revealedBoxes.includes(index) && (
                        <div 
                            key={index}
                            className="image-reveal-box"
                            style={{
                                width: `${imgRef.current ? (imgRef.current.clientWidth * 0.2) : '20%'}`,
                                height: `${imgRef.current ? (imgRef.current.clientHeight * 0.2) : '20%'}`,
                                top: `${Math.floor(index / 5) * 20}%`,
                                left: `${(index % 5) * 20}%`
                            }}
                            onClick={() => toggleBox(index)}
                        ></div>
                    )
                ))}
            </div>
            {showInstruction && (
                <div className="image-reveal-instruction">
                    <h1>Image Reveal</h1>
                    <p>click boxes to reveal</p>
                </div>
            )}
        </div>
    );
}

export default ImageReveal;
