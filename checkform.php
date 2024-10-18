<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thêm Sản Phẩm</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h2>Thêm Sản Phẩm</h2>
        <form id="product-form" enctype="multipart/form-data">
            <div class="mb-3">
                <label for="name" class="form-label">Tên sản phẩm</label>
                <input type="text" class="form-control" id="name" name="name" required>
            </div>

            <div class="mb-3">
                <label for="description" class="form-label">Mô tả</label>
                <textarea class="form-control" id="description" name="description" rows="3" required></textarea>
            </div>

            <div class="mb-3">
                <label for="price" class="form-label">Giá</label>
                <input type="number" class="form-control" id="price" name="price" step="0.01" required>
            </div>

            <div class="mb-3">
                <label for="stock_quantity" class="form-label">Số lượng trong kho</label>
                <input type="number" class="form-control" id="stock_quantity" name="stock_quantity" required>
            </div>

            <div class="mb-3">
                <label for="promotional_price" class="form-label">Giá khuyến mại</label>
                <input type="number" class="form-control" id="promotional_price" name="promotional_price" step="0.01">
            </div>

            <div class="mb-3">
                <label for="status" class="form-label">Trạng thái</label>
                <select class="form-select" id="status" name="status" required>
                    <option value="public">Public</option>
                    <option value="unpublic">Unpublic</option>
                    <option value="hidden">Hidden</option>
                </select>
            </div>

            <div class="mb-3">
                <label for="sku" class="form-label">SKU</label>
                <input type="text" class="form-control" id="sku" name="sku" required>
            </div>

            <div class="mb-3">
                <label for="thumbnail" class="form-label">Hình ảnh</label>
                <input type="file" class="form-control" id="thumbnail" name="thumbnail">
            </div>

            <div class="mb-3">
                <label for="hagtag" class="form-label">Hagtag</label>
                <input type="text" class="form-control" id="hagtag" name="hagtag">
            </div>

            <!-- Thêm Biến Thể Sản Phẩm -->
            <div class="mb-3">
                <h4>Biến thể sản phẩm</h4>
                <div id="variants">
                    <div class="variant row mb-2">
                        <div class="col-md-3">
                            <label for="size" class="form-label">Size</label>
                            <select class="form-select" name="variants[0][size_id]" required>
                                <option value="1">Small</option>
                                <option value="2">Medium</option>
                                <option value="3">Large</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label for="color" class="form-label">Color</label>
                            <select class="form-select" name="variants[0][color_id]" required>
                                <option value="1">Red</option>
                                <option value="2">Blue</option>
                                <option value="3">Green</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label for="quantity" class="form-label">Số lượng</label>
                            <input type="number" class="form-control" name="variants[0][quantity]" required>
                        </div>

                        <div class="col-md-3">
                            <label for="variant_image" class="form-label">Hình ảnh biến thể</label>
                            <input type="file" class="form-control" name="variants[0][image_variant]">
                        </div>
                    </div>
                </div>

                <button type="button" class="btn btn-secondary mt-2" id="add-variant">Thêm biến thể</button>
            </div>

            <button type="submit" class="btn btn-primary">Thêm sản phẩm</button>
        </form>
    </div>

    <script>
        let variantIndex = 1;
        document.getElementById('add-variant').addEventListener('click', function () {
            const variantHTML = `
                <div class="variant row mb-2">
                    <div class="col-md-3">
                        <label for="size" class="form-label">Size</label>
                        <select class="form-select" name="variants[${variantIndex}][size_id]" required>
                            <option value="1">Small</option>
                            <option value="2">Medium</option>
                            <option value="3">Large</option>
                        </select>
                    </div>

                    <div class="col-md-3">
                        <label for="color" class="form-label">Color</label>
                        <select class="form-select" name="variants[${variantIndex}][color_id]" required>
                            <option value="1">Red</option>
                            <option value="2">Blue</option>
                            <option value="3">Green</option>
                        </select>
                    </div>

                    <div class="col-md-3">
                        <label for="quantity" class="form-label">Số lượng</label>
                        <input type="number" class="form-control" name="variants[${variantIndex}][quantity]" required>
                    </div>

                    <div class="col-md-3">
                        <label for="variant_image" class="form-label">Hình ảnh biến thể</label>
                        <input type="file" class="form-control" name="variants[${variantIndex}][image_variant]">
                    </div>
                </div>
            `;

            document.getElementById('variants').insertAdjacentHTML('beforeend', variantHTML);
            variantIndex++;
        });

        document.getElementById('product-form').addEventListener('submit', function (event) {
            event.preventDefault();
            // Thực hiện gửi dữ liệu lên API thêm sản phẩm
            const formData = new FormData(this);
            
            fetch('/api/products', {
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Sản phẩm đã được thêm thành công!');
                    location.reload(); // Reload lại trang
                } else {
                    alert('Có lỗi xảy ra: ' + JSON.stringify(data.errors));
                }
            })
            .catch(error => console.error('Lỗi:', error));
        });
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
