import React, { useEffect } from 'react';
import Image from 'next/image';

interface ProjectDetailModalProps {
  project: {
    title: string;
    location: string;
    solarPanelBrand: string;
    inverterBrand: string;
    imageUrl: string;
    capacity: string;
    category?: string;
  };
  onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  // Add escape key handler for the modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="close-button" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="modal-image">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 1200px) 90vw, 70vw"
            priority
            style={{ objectFit: "cover" }}
          />
          <div className="modal-capacity-badge">
            {project.capacity}
          </div>
          {project.category && (
            <div className="modal-category-badge">
              {project.category}
            </div>
          )}
        </div>
        
        <div className="modal-details">
          <h2>{project.title}</h2>
          
          <div className="detail-grid">
            <div className="detail-item">
              <h3>Location</h3>
              <p>{project.location}</p>
            </div>
            
            <div className="detail-item">
              <h3>Solar Panel Brand</h3>
              <p>{project.solarPanelBrand}</p>
            </div>
            
            <div className="detail-item">
              <h3>Inverter Brand</h3>
              <p>{project.inverterBrand}</p>
            </div>
            
            <div className="detail-item">
              <h3>Capacity</h3>
              <p>{project.capacity}</p>
            </div>
          </div>
          
          <div className="project-description">
            <h3>Project Overview</h3>
            <p>This {project.category} solar installation provides clean, renewable energy with a capacity of {project.capacity}. 
            The system utilizes high-quality {project.solarPanelBrand} solar panels paired with reliable {project.inverterBrand} 
            for optimal performance and efficiency.</p>
            
            <div className="benefits">
              <h4>Key Benefits:</h4>
              <ul>
                <li>Reduced carbon footprint</li>
                <li>Lower energy costs</li>
                <li>Energy independence</li>
                <li>Long-term sustainable power solution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 99999;
          padding: 20px;
          overflow-y: auto;
          isolation: isolate;
          will-change: transform;
        }
        
        .modal-content {
          background: white;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 20px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalFadeIn 0.3s ease-out;
          margin: 40px 0;
          transform: translateZ(0);
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .close-button {
          position: absolute;
          top: 15px;
          right: 20px;
          background: #e53e3e;
          border: none;
          color: white;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          z-index: 100000;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          border: 2px solid white;
        }
        
        .close-button:hover {
          background: #c53030;
          transform: scale(1.1);
        }
        
        .modal-image {
          position: relative;
          height: 300px;
          width: 100%;
        }
        
        .modal-capacity-badge {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background-color: #FFD700;
          color: #1A3B29;
          font-weight: bold;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 1.1rem;
        }
        
        .modal-category-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background-color: #1A3B29;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          text-transform: capitalize;
          font-size: 1.1rem;
        }
        
        .modal-details {
          padding: 30px;
          overflow-y: auto;
        }
        
        .modal-details h2 {
          font-size: 2rem;
          margin: 0 0 20px 0;
          color: #1A3B29;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .detail-item h3 {
          font-size: 1.1rem;
          color: #2563EB;
          margin: 0 0 5px 0;
        }
        
        .detail-item p {
          font-size: 1.2rem;
          margin: 0;
          color: #333;
        }
        
        .project-description {
          margin-top: 20px;
        }
        
        .project-description h3 {
          font-size: 1.4rem;
          margin: 0 0 15px 0;
          color: #1A3B29;
        }
        
        .project-description p {
          line-height: 1.6;
          color: #444;
          margin-bottom: 20px;
        }
        
        .benefits h4 {
          font-size: 1.2rem;
          margin: 0 0 10px 0;
          color: #2563EB;
        }
        
        .benefits ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .benefits li {
          margin-bottom: 5px;
          color: #444;
        }
        
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailModal; 