import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

/**
 * SettingFormModal - Modal for Create/Edit Setting
 */
const SettingFormModal = ({ isOpen, onClose, onSave, settingData = null, isSubmitting = false }) => {
    const initialState = {
        key_name: '',
        value: '',
        type: 'string', // string, number, json, boolean
        description: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (settingData) {
            setFormData({
                key_name: settingData.key_name || '',
                value: settingData.value || '',
                type: settingData.type || 'string',
                description: settingData.description || ''
            });
        } else {
            setFormData(initialState);
        }
        setErrors({});
    }, [settingData, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.key_name.trim()) newErrors.key_name = 'Key name is required';
        if (formData.type === 'json') {
            try {
                if (formData.value) JSON.parse(formData.value);
            } catch (e) {
                newErrors.value = 'Invalid JSON format';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        let newValue = formData.value;

        // Default values based on type if current value is empty
        if (!newValue) {
            if (newType === 'boolean') newValue = 'false';
            if (newType === 'number') newValue = '0';
            if (newType === 'json') newValue = '{}';
        }

        setFormData({ ...formData, type: newType, value: newValue });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>{settingData ? 'Edit Setting' : 'Tambah Setting Baru'}</h3>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Key Name (Slug)</label>
                        <input
                            type="text"
                            className={errors.key_name ? 'input-error' : ''}
                            placeholder="e.g. app_name, target_zakat_2026"
                            value={formData.key_name}
                            onChange={(e) => setFormData({ ...formData, key_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            disabled={settingData !== null}
                        />
                        {errors.key_name && <p className="error-text">{errors.key_name}</p>}
                    </div>

                    <div className="form-group">
                        <label>Value Type</label>
                        <select value={formData.type} onChange={handleTypeChange}>
                            <option value="string">String (Text)</option>
                            <option value="number">Number (Integer/Decimal)</option>
                            <option value="boolean">Boolean (True/False)</option>
                            <option value="json">JSON (Object/Array)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Value</label>
                        {formData.type === 'boolean' ? (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="bool_val"
                                        checked={formData.value === 'true' || formData.value === '1'}
                                        onChange={() => setFormData({ ...formData, value: 'true' })}
                                    /> True
                                </label>
                                <label className="radio-label">
                                    <input
                                        type="radio"
                                        name="bool_val"
                                        checked={formData.value === 'false' || formData.value === '0'}
                                        onChange={() => setFormData({ ...formData, value: 'false' })}
                                    /> False
                                </label>
                            </div>
                        ) : formData.type === 'json' ? (
                            <textarea
                                className={errors.value ? 'input-error' : ''}
                                rows={6}
                                style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                                placeholder='{"key": "value"}'
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        ) : (
                            <input
                                type={formData.type === 'number' ? 'number' : 'text'}
                                className={errors.value ? 'input-error' : ''}
                                placeholder="Enter setting value"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        )}
                        {errors.value && <p className="error-text">{errors.value}</p>}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            rows={3}
                            placeholder="Brief explanation of what this setting does"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="alert alert-danger" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <AlertCircle size={18} />
                            <span>Mohon lengkapi semua field yang wajib diisi.</span>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            {isSubmitting ? 'Menyimpan...' : (
                                <>
                                    <Save size={18} />
                                    <span>Simpan Setting</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingFormModal;
