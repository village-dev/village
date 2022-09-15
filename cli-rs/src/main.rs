use clap::{Parser, Subcommand};
use tokio;

mod cli;
use cli::{login,logout};

#[derive(Parser)]
struct Root {
    #[clap(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Login,
    Logout,
}

#[tokio::main]
async fn main() {
    let args = Root::parse();

    match &args.command {
        Commands::Login => {
            login::login().await
        }
        Commands::Logout => {
            logout::logout().ok();
        }
    }
}
