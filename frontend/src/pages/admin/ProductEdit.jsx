import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';

const ProductEdit = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const userInfo = useUserStore((state) => state.userInfo);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [ram, setRam] = useState('');
  const [processor, setProcessor] = useState('');
  const [storage, setStorage] = useState('');
  const [screen, setScreen] = useState('');
  const [loadingUpload, setLoadingUpload] = useState(false);
  
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setBrand(data.brand);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);
        if (data.specs) {
          setRam(data.specs.ram || '');
          setProcessor(data.specs.processor || '');
          setStorage(data.specs.storage || '');
          setScreen(data.specs.screen || '');
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setLoadingUpload(true);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed');
      setImage(data.image);
      setLoadingUpload(false);
    } catch (err) {
      console.error(err);
      setLoadingUpload(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const url = isEditMode ? `/api/products/${id}` : `/api/products`;
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ 
          name, price, image, brand, category, countInStock, description,
          specs: { ram, processor, storage, screen }
        }),
      });
      if (res.ok) {
        navigate('/admin/products');
      } else {
        alert('Failed to save product. Please check your inputs.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/admin/products" className="btn btn-outline" style={{ marginBottom: '2rem' }}>Go Back</Link>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>{isEditMode ? 'Edit Product' : 'Create Product'}</h2>
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (PKR)</label>
              <input type="number" className="form-control" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Count</label>
              <input type="number" className="form-control" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Image Format</label>
            <input type="text" className="form-control" value={image} onChange={(e) => setImage(e.target.value)} required style={{ marginBottom: '0.5rem' }} />
            <input type="file" onChange={uploadFileHandler} className="form-control" style={{ padding: '0.5rem' }} />
            {loadingUpload && <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>Uploading file to server...</span>}
          </div>
          <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input type="text" className="form-control" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">-- Select Category --</option>
                <option value="Laptops">Laptops</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Audio">Audio</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Tablets">Tablets</option>
                <option value="Cameras">Cameras</option>
                <option value="Gaming">Gaming</option>
                <option value="Monitors">Monitors</option>
                <option value="Networking">Networking</option>
                <option value="Storage">Storage</option>
                <option value="Smart Home">Smart Home</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" required />
          </div>

          <div style={{ background: 'var(--color-bg-alt)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--color-text)' }}>Technical Specifications</h3>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">RAM (e.g. 16GB)</label>
                <input type="text" className="form-control" value={ram} onChange={(e) => setRam(e.target.value)} placeholder="16GB" />
              </div>
              <div className="form-group">
                <label className="form-label">Processor (e.g. Intel i7)</label>
                <input type="text" className="form-control" value={processor} onChange={(e) => setProcessor(e.target.value)} placeholder="Intel i7" />
              </div>
              <div className="form-group">
                <label className="form-label">Storage (e.g. 512GB SSD)</label>
                <input type="text" className="form-control" value={storage} onChange={(e) => setStorage(e.target.value)} placeholder="512GB SSD" />
              </div>
              <div className="form-group">
                <label className="form-label">Screen (e.g. 15.6" OLED)</label>
                <input type="text" className="form-control" value={screen} onChange={(e) => setScreen(e.target.value)} placeholder='15.6" OLED' />
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
