// plz run rustup override set nightly   
#![feature(proc_macro)]
#[macro_use]

extern crate stdweb;

use stdweb::js_export;


#[js_export]
fn init() {
  stdweb::initialize();
  js! {
    console.log("hello from rust");
  }
}

fn main() {}

// // Functions that you wish to access from Javascript
// // must be marked as no_mangle
// #[no_mangle]
// pub fn add(a: i32, b: i32) -> i32 {
//     return a + b
// }