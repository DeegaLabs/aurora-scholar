use anchor_lang::prelude::*;

declare_id!("HoRNS4q7T69m6YHYx8Qsg4kAffwNNu8R25XpReZnvWAe");

#[program]
pub mod aurora_scholar {
    use super::*;

    pub fn publish_article(
        ctx: Context<PublishArticle>,
        content_hash: [u8; 32],
        intuition_hash: [u8; 32],
        arweave_id: String,
        title: String,
        ai_scope: String,
        is_public: bool,
    ) -> Result<()> {
        let article = &mut ctx.accounts.article;
        let clock = Clock::get()?;

        article.author = ctx.accounts.author.key();
        article.content_hash = content_hash;
        article.intuition_hash = intuition_hash;
        article.arweave_id = arweave_id;
        article.title = title;
        article.ai_scope = ai_scope;
        article.is_public = is_public;
        article.timestamp = clock.unix_timestamp;
        article.bump = ctx.bumps.article;

        emit!(ArticlePublished {
            author: article.author,
            content_hash: article.content_hash,
            timestamp: article.timestamp,
            is_public: article.is_public,
        });

        Ok(())
    }

    pub fn update_visibility(
        ctx: Context<UpdateVisibility>,
        is_public: bool,
    ) -> Result<()> {
        let article = &mut ctx.accounts.article;

        require!(
            article.author == ctx.accounts.author.key(),
            AuroraError::Unauthorized
        );

        article.is_public = is_public;

        emit!(VisibilityUpdated {
            article: ctx.accounts.article.key(),
            is_public,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(content_hash: [u8; 32])]
pub struct PublishArticle<'info> {
    #[account(
        init,
        payer = author,
        space = Article::SPACE,
        seeds = [b"article", author.key().as_ref(), &content_hash],
        bump
    )]
    pub article: Account<'info, Article>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVisibility<'info> {
    #[account(mut)]
    pub article: Account<'info, Article>,

    pub author: Signer<'info>,
}

#[account]
pub struct Article {
    pub author: Pubkey,           // 32 bytes
    pub content_hash: [u8; 32],   // 32 bytes
    pub intuition_hash: [u8; 32], // 32 bytes
    pub arweave_id: String,       // 4 + 64 bytes (max)
    pub title: String,            // 4 + 128 bytes (max)
    pub ai_scope: String,         // 4 + 256 bytes (max)
    pub is_public: bool,          // 1 byte
    pub timestamp: i64,           // 8 bytes
    pub bump: u8,                 // 1 byte
}

impl Article {
    pub const SPACE: usize = 8 +  // discriminator
        32 +                       // author
        32 +                       // content_hash
        32 +                       // intuition_hash
        (4 + 64) +                // arweave_id
        (4 + 128) +               // title
        (4 + 256) +               // ai_scope
        1 +                        // is_public
        8 +                        // timestamp
        1;                         // bump
}

#[event]
pub struct ArticlePublished {
    pub author: Pubkey,
    pub content_hash: [u8; 32],
    pub timestamp: i64,
    pub is_public: bool,
}

#[event]
pub struct VisibilityUpdated {
    pub article: Pubkey,
    pub is_public: bool,
}

#[error_code]
pub enum AuroraError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Invalid content hash")]
    InvalidContentHash,
    #[msg("Title too long (max 128 chars)")]
    TitleTooLong,
    #[msg("AI scope too long (max 256 chars)")]
    AiScopeTooLong,
}

