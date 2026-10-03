// Shopify hosts GLB product media. STL conversion/upload belongs to a later release.
export function modelSource(product) {
  for (const media of product.media?.nodes || []) {
    for (const source of media.sources || []) {
      try {
        const url = new URL(source.url);
        if (source.mimeType === 'model/gltf-binary' && url.protocol === 'https:') return url.href;
      } catch { /* Incomplete or unsupported media stays a photo. */ }
    }
  }
  return null;
}

let viewerModule;
function loadViewer() {
  // Download only after the visitor requests an existing model.
  return viewerModule ||= import('https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js').catch(error => {
    viewerModule = null;
    throw error;
  });
}

export function attachProductModel(content, product) {
  const src = modelSource(product);
  if (!src) return;
  const photo = content.querySelector('.detail-art');
  const controls = document.createElement('div');
  controls.className = 'product-media-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Vista del producto');
  const photoButton = document.createElement('button');
  photoButton.textContent = 'Foto';
  photoButton.type = 'button';
  photoButton.hidden = !photo;
  const modelButton = document.createElement('button');
  modelButton.textContent = 'Ver en 3D';
  modelButton.type = 'button';
  controls.append(photoButton, modelButton);
  const stage = document.createElement('div');
  stage.className = 'model-stage';
  stage.hidden = true;
  const status = document.createElement('p');
  status.className = 'model-status';
  status.setAttribute('role', 'status');
  let viewer;
  let loading = false;
  function show(model) {
    if (photo) photo.hidden = model;
    stage.hidden = !model;
    status.hidden = !model;
    photoButton.setAttribute('aria-pressed', String(!model));
    modelButton.setAttribute('aria-pressed', String(model));
  }
  photoButton.onclick = () => show(false);
  modelButton.onclick = async () => {
    show(true);
    if (viewer || loading) return;
    loading = true;
    status.textContent = 'Cargando modelo 3D…';
    try {
      await loadViewer();
      if (!content.isConnected || !stage.isConnected) return;
      viewer = document.createElement('model-viewer');
      viewer.setAttribute('alt', `Modelo 3D de ${product.title}`);
      viewer.setAttribute('camera-controls', '');
      viewer.setAttribute('touch-action', 'pan-y');
      viewer.setAttribute('shadow-intensity', '1');
      viewer.setAttribute('loading', 'eager');
      viewer.addEventListener('load', () => { status.textContent = 'Arrastra para girar. Acerca para explorar los detalles.'; });
      viewer.addEventListener('error', () => {
        status.textContent = 'No se pudo cargar el modelo. Puedes volver a la foto o pulsar Ver en 3D para reintentar.';
        viewer?.remove();
        viewer = null;
      });
      viewer.setAttribute('src', src);
      stage.append(viewer);
    } catch {
      status.textContent = 'No se pudo abrir el visor. Puedes volver a la foto o pulsar Ver en 3D para reintentar.';
    } finally { loading = false; }
  };
  if (photo) photo.after(controls, stage, status);
  else content.prepend(controls, stage, status);
  show(false);
}
