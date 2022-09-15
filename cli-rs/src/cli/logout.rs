use std::fs;

pub fn logout() -> std::io::Result<()> {
    let home_dir = dirs::home_dir().unwrap();
    fs::remove_file(home_dir.join(".village/tokens.json"))?;
    Ok(())
}