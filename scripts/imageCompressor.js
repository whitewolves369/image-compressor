// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成');

    // 获取DOM元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const imageList = document.getElementById('imageList');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // 检查DOM元素是否都获取成功
    console.log('DOM元素检查:', {
        dropZone: !!dropZone,
        fileInput: !!fileInput,
        imageList: !!imageList,
        qualitySlider: !!qualitySlider,
        qualityValue: !!qualityValue,
        compressBtn: !!compressBtn,
        downloadBtn: !!downloadBtn,
        loadingOverlay: !!loadingOverlay
    });

    // 确保加载状态默认是隐藏的
    loadingOverlay.style.display = 'none';
    console.log('加载状态:', loadingOverlay.style.display === 'none');

    // 显示/隐藏加载状态的函数
    const showLoading = () => {
        loadingOverlay.style.display = 'flex';
        console.log('显示加载状态');
    };

    const hideLoading = () => {
        loadingOverlay.style.display = 'none';
        console.log('隐藏加载状态');
    };

    // 存储所有待处理的图片
    let imageItems = [];

    // 处理拖放
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#2196f3';
    }

    function handleDrop(e) {
        console.log('文件拖放');
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#ccc';
        
        const files = e.dataTransfer.files;
        handleFiles(Array.from(files));
    }

    // 处理文件选择
    function handleFileSelect(e) {
        console.log('文件选择');
        const files = e.target.files;
        handleFiles(Array.from(files));
    }

    // 处理多个文件
    function handleFiles(files) {
        console.log('处理文件数量:', files.length);
        
        // 过滤出图片文件
        const imageFiles = files.filter(file => {
            const imageTypes = /^image\/(jpeg|png|jpg)$/i;
            return imageTypes.test(file.type);
        });

        if (imageFiles.length === 0) {
            alert('请选择 JPG 或 PNG 图片文件！');
            return;
        }

        // 清空现有列表
        imageList.innerHTML = '';
        imageItems = [];

        // 处理每个图片文件
        imageFiles.forEach((file, index) => {
            const item = createImageItem(file, index);
            imageItems.push(item);
            imageList.appendChild(item.element);
            loadImagePreview(item);
        });

        // 启用压缩按钮
        compressBtn.disabled = false;
    }

    // 创建图片项
    function createImageItem(file, index) {
        const element = document.createElement('div');
        element.className = 'image-item';
        element.innerHTML = `
            <h3 title="${file.name}">${file.name}</h3>
            <div class="image-preview">
                <div class="preview-side">
                    <h4>原图</h4>
                    <img class="preview-image original" alt="原图预览">
                    <div class="file-info">
                        <span class="original-size">${formatFileSize(file.size)}</span>
                    </div>
                </div>
                <div class="preview-side">
                    <h4>压缩后</h4>
                    <img class="preview-image compressed" alt="压缩后预览">
                    <div class="file-info">
                        <span class="compressed-size">待处理</span>
                    </div>
                </div>
            </div>
            <div class="status">等待压缩</div>
        `;

        return {
            element,
            file,
            index,
            originalPreview: element.querySelector('.original'),
            compressedPreview: element.querySelector('.compressed'),
            originalSize: element.querySelector('.original-size'),
            compressedSize: element.querySelector('.compressed-size'),
            status: element.querySelector('.status'),
            compressed: false,
            compressedBlob: null
        };
    }

    // 加载图片预览
    function loadImagePreview(item) {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log(`原图 ${item.index} 加载完成`);
            item.originalPreview.src = e.target.result;
        };
        reader.readAsDataURL(item.file);
    }

    // 压缩单个图片
    async function compressImage(item) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Blob创建失败'));
                                return;
                            }
                            
                            // 更新预览
                            const url = URL.createObjectURL(blob);
                            item.compressedPreview.src = url;
                            item.compressedSize.textContent = formatFileSize(blob.size);
                            item.compressed = true;
                            item.compressedBlob = blob;
                            resolve();
                        },
                        item.file.type,
                        qualitySlider.value / 100
                    );
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            img.src = item.originalPreview.src;
        });
    }

    // 压缩所有图片
    async function compressAllImages() {
        console.log('开始压缩所有图片');
        if (imageItems.length === 0) {
            console.log('没有选择文件');
            return;
        }

        showLoading();
        compressBtn.disabled = true;
        downloadBtn.disabled = true;

        try {
            for (const item of imageItems) {
                item.status.textContent = '压缩中...';
                item.status.className = 'status';
                
                try {
                    await compressImage(item);
                    item.status.textContent = '压缩完成';
                    item.status.className = 'status success';
                } catch (error) {
                    console.error(`图片 ${item.index} 压缩失败:`, error);
                    item.status.textContent = '压缩失败';
                    item.status.className = 'status error';
                }
            }

            // 检查是否有成功压缩的图片
            const hasCompressed = imageItems.some(item => item.compressed);
            downloadBtn.disabled = !hasCompressed;
        } catch (error) {
            console.error('压缩过程失败:', error);
            alert('图片压缩失败，请重试');
        } finally {
            hideLoading();
            compressBtn.disabled = false;
        }
    }

    // 下载所有压缩后的图片
    function downloadAllImages() {
        console.log('开始下载所有图片');
        
        imageItems.forEach(item => {
            if (item.compressed && item.compressedBlob) {
                const link = document.createElement('a');
                link.download = `compressed_${item.file.name}`;
                link.href = URL.createObjectURL(item.compressedBlob);
                link.click();
            }
        });
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 事件监听器设置
    dropZone.addEventListener('click', () => {
        console.log('点击上传区域');
        fileInput.click();
    });
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value;
    });
    compressBtn.addEventListener('click', compressAllImages);
    downloadBtn.addEventListener('click', downloadAllImages);
});

// 防止拖放事件冒泡
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());