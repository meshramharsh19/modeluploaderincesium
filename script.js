Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZjI2M2I5YS04YTVkLTRhOWYtYmFiMi0yMzRmOGIyNTE2OTkiLCJpZCI6MjY2MDc4LCJpYXQiOjE3MzY1MDQ0Nzl9.ST6Sriro-NE-NjBF1Gu_yRfyzQEqacBx1HR6zsnJYcM';

const viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
        url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }),
    terrainProvider: Cesium.createWorldTerrain()
});

let modelEntity = null;

    const uploadInput = document.getElementById('modelUpload');
    uploadInput.addEventListener('change', (event) => {

      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        if (file.name.endsWith('.obj')) {
          const loader = new THREE.OBJLoader();
          const object = loader.parse(e.target.result); 

          const scene = new THREE.Scene();
          scene.add(object);

          const exporter = new THREE.GLTFExporter();
          exporter.parse(scene, function (gltf) {
            const modelUrl = URL.createObjectURL(new Blob([gltf], { type: 'model/gltf-binary' })); 

            modelEntity = viewer.entities.add({
              name: file.name,
              position: Cesium.Cartesian3.fromDegrees(parseFloat(document.getElementById('longitude').value), 
                                                      parseFloat(document.getElementById('latitude').value), 
                                                      parseFloat(document.getElementById('height').value)),
              orientation: Cesium.Transforms.headingPitchRollQuaternion(
                Cesium.Cartesian3.fromDegrees(parseFloat(document.getElementById('longitude').value), 
                                              parseFloat(document.getElementById('latitude').value), 
                                              parseFloat(document.getElementById('height').value)),
                new Cesium.HeadingPitchRoll(
                  Cesium.Math.toRadians(parseFloat(document.getElementById('heading').value)),
                  Cesium.Math.toRadians(parseFloat(document.getElementById('pitch').value)), 
                  Cesium.Math.toRadians(parseFloat(document.getElementById('roll').value))
                )
              ),
              model: {
                uri: modelUrl 
              }
            });
            viewer.trackedEntity = modelEntity;
          }, { binary: true }); 

        } else { 
          const modelUrl = e.target.result; 

          modelEntity = viewer.entities.add({
            name: file.name,
            position: Cesium.Cartesian3.fromDegrees(parseFloat(document.getElementById('longitude').value), 
                                                    parseFloat(document.getElementById('latitude').value), 
                                                    parseFloat(document.getElementById('height').value)),
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
              Cesium.Cartesian3.fromDegrees(parseFloat(document.getElementById('longitude').value), 
                                            parseFloat(document.getElementById('latitude').value), 
                                            parseFloat(document.getElementById('height').value)),
              new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(parseFloat(document.getElementById('heading').value)), 
                Cesium.Math.toRadians(parseFloat(document.getElementById('pitch').value)), 
                Cesium.Math.toRadians(parseFloat(document.getElementById('roll').value))
              )
            ),
            model: {
              uri: modelUrl
            }
            
          });
          viewer.trackedEntity = modelEntity;
        }
      }

      if (file.name.endsWith('.obj')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file); 
      }
    });
    window.addEventListener('message', function(event) {
        if (event.data.type === "latlongData") {
          document.getElementById('latitude').value = event.data.latitude.toFixed(6);
          document.getElementById('longitude').value = event.data.longitude.toFixed(6);
          updateModelPosition();
        }
      });

    // Event listeners for input fields
    document.getElementById('heading').addEventListener('input', updateModelOrientation);
    document.getElementById('pitch').addEventListener('input', updateModelOrientation);
    document.getElementById('roll').addEventListener('input', updateModelOrientation);

    function updateModelOrientation() {
      if (modelEntity) {
        const heading = Cesium.Math.toRadians(parseFloat(document.getElementById('heading').value));
        const pitch = Cesium.Math.toRadians(parseFloat(document.getElementById('pitch').value));
        const roll = Cesium.Math.toRadians(parseFloat(document.getElementById('roll').value));

        const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(modelEntity.position.getValue(), hpr);
        modelEntity.orientation = orientation;
      }
    }

    document.getElementById('longitude').addEventListener('input', updateModelPosition);
    document.getElementById('latitude').addEventListener('input', updateModelPosition);
    document.getElementById('height').addEventListener('input', updateModelPosition);

    function updateModelPosition() {
      if (modelEntity) {
        const longitude = parseFloat(document.getElementById('longitude').value);
        const latitude = parseFloat(document.getElementById('latitude').value);
        const height = parseFloat(document.getElementById('height').value);

        const newPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        modelEntity.position = newPosition;
        viewer.trackedEntity = modelEntity; 
      }
    }

    // Appearance controls
    const modelColorInput = document.getElementById('modelColor');
    modelColorInput.addEventListener('change', updateModelColor);

    function updateModelColor() {
      if (modelEntity) {
        const color = Cesium.Color.fromCssColorString(modelColorInput.value);
        modelEntity.model.color = color; 
      }
    }

    const modelOpacityInput = document.getElementById('modelOpacity');
    modelOpacityInput.addEventListener('input', updateModelOpacity);

    function updateModelOpacity() {
      if (modelEntity) {
        const opacity = parseFloat(modelOpacityInput.value);
        modelEntity.model.silhouetteColor = Cesium.Color.WHITE.withAlpha(opacity); 
        modelEntity.model.color = Cesium.Color.WHITE.withAlpha(opacity); 
      }
    }