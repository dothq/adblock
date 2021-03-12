//* Web stuff
// Note that to run this code you have to run the following code in the rust directory
// `rustup override set nightly`
use wasm_bindgen::prelude::*;
use web_sys::console;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

//* Other libraries
extern crate globset;
use globset::{Glob, GlobSet, GlobSetBuilder};

static mut BLACK_LIST: Option<Box<GlobSet>> = Option::None;

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    // Your code goes here!
    console::log_1(&JsValue::from_str("Rust has loaded!"));

    Ok(())
}

#[wasm_bindgen]
pub fn init_blacklist(patterns: Vec<JsValue>) {
    let mut glob_builder = GlobSetBuilder::new();

    // Add all of the patterns to the GlobSet
    for pattern in patterns {
        glob_builder.add(Glob::new(&pattern.as_string().unwrap()).unwrap());
    }

    unsafe {
        BLACK_LIST = Option::Some(Box::new(glob_builder.build().unwrap()));
    }
}

#[wasm_bindgen]
pub fn test_blacklist(url: String) -> bool {
    // console::log_1(&JsValue::from_str("Blacklist test"));

    unsafe {
        if BLACK_LIST.is_none() {
            // js! {
            //     console.log("The blacklist has not been loaded")
            // }
            // println!("Needs to init");
            return false;
        } else {
            return BLACK_LIST.clone().unwrap().as_ref().is_match(url);
        }
    }
}

fn main() {}

// unsafe {
//     if BLACK_LIST.is_none() {
//         // js! {
//         //     console.log("The blacklist has not been loaded")
//         // }
//         println!("Needs to init");
//         return false;
//     } else {
//         return BLACK_LIST.clone().unwrap().as_ref().is_match(url);
//     }
// }

#[wasm_bindgen]
pub fn times_two(n: u32) -> u32 {
    n * 2
}

// #[cfg(test)]
// mod tests {
//     use super::*;
//     #[test]
//     fn blacklsist() {
//         init_blacklist(vec!["*://*.doubleclick.net/*".to_string()]);
//         println!("{}", test_blacklist("https://doubleclick.net/".to_string()));
//         panic!()
//     }
// }

// // Functions that you wish to access from Javascript
// // must be marked as no_mangle
// #[no_mangle]
// pub fn add(a: i32, b: i32) -> i32 {
//     return a + b
// }
