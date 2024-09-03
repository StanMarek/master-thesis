use three_rs::prelude::*;
use wasm_bindgen::prelude::*;
use web_sys::{window, HtmlCanvasElement};
use yew::prelude::*;

#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    yew::Renderer::<App>::new().render();
    Ok(())
}

struct App;

impl Component for App {
    type Message = ();
    type Properties = ();

    fn create(ctx: &Context<Self>) -> Self {
        Self
    }

    fn view(&self, ctx: &Context<Self>) -> Html {
        html! {
            <canvas id="three-canvas" style="width: 100%; height: 80vh; background: white;"></canvas>
        }
    }

    fn rendered(&mut self, ctx: &Context<Self>, _first_render: bool) {
        let window = window().unwrap();
        let document = window.document().unwrap();
        let canvas = document
            .get_element_by_id("three-canvas")
            .unwrap()
            .dyn_into::<HtmlCanvasElement>()
            .unwrap();

        let renderer = WebGLRenderer::new(canvas).unwrap();
        renderer.set_size(
            window.inner_width().unwrap().as_f64().unwrap() as u32,
            window.inner_height().unwrap().as_f64().unwrap() as u32,
        );

        let scene = Scene::new();
        let camera = PerspectiveCamera::new(
            75.0,
            window.inner_width().unwrap().as_f64().unwrap()
                / window.inner_height().unwrap().as_f64().unwrap(),
            0.1,
            1000.0,
        );
        camera.position().set_z(5.0);

        let geometry = BufferGeometry::new();
        let vertices: Vec<f32> = vec![
            // Add vertex positions here as flattened array
        ];
        geometry.set_attribute("position", Float32BufferAttribute::new(vertices.into(), 3));

        let material = LineBasicMaterial::new().color(Color::hex(0xFF5733));
        let lines = LineSegments::new(geometry.clone(), material.clone());

        let spheres_group = Group::new();

        let vertex_data = vec![
            // Add vertices and their colors here
        ];

        for vertex in vertex_data {
            let sphere_geometry = SphereGeometry::new(0.2, 4, 4);
            let color = Color::hex(vertex.color);
            let sphere_material = MeshBasicMaterial::new().color(color);
            let sphere = Mesh::new(sphere_geometry, sphere_material);
            sphere.position().set(vertex.x, vertex.y, vertex.z);

            spheres_group.add(sphere);
        }

        scene.add(&lines);
        scene.add(&spheres_group);

        let ambient_light = AmbientLight::new(Color::white(), 0.5);
        scene.add(&ambient_light);

        let directional_light = DirectionalLight::new(Color::white(), 1.0);
        directional_light.position().set(5.0, 5.0, 5.0);
        scene.add(&directional_light);

        let axes_helper = AxesHelper::new(5.0);
        axes_helper.position().set(-7.0, -7.0, -7.0);
        scene.add(&axes_helper);

        renderer.render(&scene, &camera);

        // If you need orbit controls, you'll have to integrate a Rust wrapper or bind to JS OrbitControls.
    }
}
