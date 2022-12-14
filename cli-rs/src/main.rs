use clap::{Parser, Subcommand};
use tokio;

mod lib;
mod cli;
use cli::{login,logout,init,deploy, token};

#[derive(Parser)]
struct Root {
    #[clap(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Login,
    Logout,
    Init,
    Deploy,
    Token
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
        Commands::Init => {
            init::init().await;
        }
        Commands::Deploy => {
            deploy::deploy().await;
        }
        Commands::Token => {
            token::token().await;
        }
    }
}
