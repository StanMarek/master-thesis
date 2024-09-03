use three_rs::prelude::*;
use wasm_bindgen::prelude::*;
use web_sys::{window, HtmlCanvasElement};
use yew::prelude::*;

#[wasm_bindgen]
pub struct MeshComponent {
    vertices: Vec<f32>,
    edges: Vec<u32>,
}

#[wasm_bindgen]
impl MeshComponent {
    #[wasm_bindgen(constructor)]
    pub fn new(vertices: Vec<f32>, edges: Vec<u32>) -> MeshComponent {
        MeshComponent { vertices, edges }
    }

    pub fn render(&self) -> Result<(), JsValue> {
        let window = window().unwrap();
        let document = window.document().unwrap();
        let canvas = document
            .get_element_by_id("canvas_id")
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

        // Geometry
        let geometry = BufferGeometry::new();
        geometry.set_attribute(
            "position",
            Float32BufferAttribute::new(self.vertices.clone(), 3),
        );

        let material = LineBasicMaterial::new().color(Color::hex(0xFF5733));
        let lines = LineSegments::new(geometry.clone(), material);

        scene.add(&lines);

        // Render
        renderer.render(&scene, &camera);
        Ok(())
    }
}

#[wasm_bindgen(start)]
pub fn run() -> Result<(), JsValue> {
    yew::Renderer::<App>::new().render();
    Ok(())
}

struct App;

impl Component for App {
    type Message = ();
    type Properties = ();

    fn create(_ctx: &Context<Self>) -> Self {
        Self
    }

    fn view(&self, _ctx: &Context<Self>) -> Html {
        html! {
            <canvas id="canvas_id" style="width: 100%; height: 80vh;"></canvas>
        }
    }

    fn rendered(&mut self, _ctx: &Context<Self>, _first_render: bool) {
        // If you need additional rendering or dynamic updates, implement them here.
    }
}
