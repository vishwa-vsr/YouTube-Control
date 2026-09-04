/**
 * YouTube Control - Comment Canvas Module
 * Handles comment & thread snapshot generation, high-DPI canvas layout,
 * sequential curved threadlines, avatar rendering, and clipboard/download export.
 */

export function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) return [];
  const paragraphs = text.split('\n');
  const lines = [];

  paragraphs.forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      return;
    }
    const words = trimmed.split(/\s+/);
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
  });

  return lines;
}

export function drawRoundedCard(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawCommentThumbIcon(ctx, x, y, color, isDislike = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  const pathData = isDislike
    ? "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.58-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"
    : "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z";
  if (typeof Path2D !== 'undefined') {
    const p = new Path2D(pathData);
    ctx.scale(0.55, 0.55);
    ctx.fill(p);
  }
  ctx.restore();
}

export function drawCreatorHeartBadge(ctx, x, y, img, colors) {
  const size = 18;
  const radius = size / 2;

  // 1. Creator Avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = colors.avatarBg;
    ctx.fill();
  }
  ctx.restore();

  // 2. Red Heart overlay on bottom-right corner
  ctx.save();
  ctx.translate(x + 9, y + 9);
  ctx.fillStyle = '#ff0000';
  if (typeof Path2D !== 'undefined') {
    const heartPath = new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
    ctx.scale(0.42, 0.42);
    ctx.fill(heartPath);
  }
  ctx.restore();
}

export function loadAvatarImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 800);
  });
}

export function extractSingleCommentData(elem) {
  if (!elem) return null;
  const authorEl = elem.querySelector('#author-text, #header-author #author-text, h3 #author-text');
  const author = authorEl ? authorEl.textContent.trim() : '@user';

  const timeEl = elem.querySelector('#published-time-text, #published-time-text a, #header-author #published-time-text');
  const time = timeEl ? timeEl.textContent.trim() : '';

  const contentEl = elem.querySelector('#content-text, #expander #content-text, yt-attributed-string#content-text');
  const commentText = contentEl ? (contentEl.innerText || contentEl.textContent || '').trim() : '';

  const voteEl = elem.querySelector('#vote-count-middle, #vote-count-left, ytd-toggle-button-renderer#like-button #vote-count-middle');
  const likes = voteEl ? voteEl.textContent.trim() : '';

  const avatarImg = elem.querySelector('#author-thumbnail img, #author-thumbnail-button img, yt-img-shadow img');
  const avatarSrc = avatarImg ? (avatarImg.currentSrc || avatarImg.src) : null;

  // Creator heart
  const heartElem = elem.querySelector('ytd-creator-heart-renderer, #creator-heart');
  let creatorHeartSrc = null;
  if (heartElem && !heartElem.hasAttribute('hidden') && heartElem.style.display !== 'none') {
    const creatorImg = heartElem.querySelector('#creator-thumbnail img, img');
    if (creatorImg) {
      creatorHeartSrc = creatorImg.currentSrc || creatorImg.src || null;
    }
  }

  return { author, time, text: commentText, likes, avatarSrc, creatorHeartSrc, hasCreatorHeart: !!creatorHeartSrc };
}

export function drawAvatarCircle(ctx, x, y, size, img, author, colors) {
  const radius = size / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img) {
    ctx.drawImage(img, x, y, size, size);
  } else {
    ctx.fillStyle = colors.avatarBg;
    ctx.fill();
    ctx.fillStyle = colors.textPrimary;
    ctx.font = `bold ${Math.round(size * 0.42)}px Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initial = (author.replace('@', '').charAt(0) || 'U').toUpperCase();
    ctx.fillText(initial, x + radius, y + radius);
  }
  ctx.restore();
}

export function setCommentCameraIcon(button) {
  if (!button) return;
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
}

export function setCommentCheckmarkIcon(button) {
  if (!button) return;
  button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#2ba640" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; display: block;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
}

export async function captureCommentToClipboard(commentEl, btnOrOptions, maybeBtn) {
  if (!commentEl) return false;

  let btnEl = null;
  let isThreadMode = undefined;

  if (typeof btnOrOptions === 'boolean') {
    isThreadMode = btnOrOptions;
    if (maybeBtn && ((typeof HTMLElement !== 'undefined' && maybeBtn instanceof HTMLElement) || maybeBtn.nodeType === 1)) {
      btnEl = maybeBtn;
    }
  } else if (btnOrOptions && ((typeof HTMLElement !== 'undefined' && btnOrOptions instanceof HTMLElement) || btnOrOptions.nodeType === 1)) {
    btnEl = btnOrOptions;
  } else if (btnOrOptions && typeof btnOrOptions === 'object') {
    btnEl = btnOrOptions.button || null;
    if (typeof btnOrOptions.isThread === 'boolean') {
      isThreadMode = btnOrOptions.isThread;
    }
  }

  const isInsideReplies = !!commentEl.closest('ytd-comment-replies-renderer');
  const mainCommentData = extractSingleCommentData(commentEl);
  if (!mainCommentData) return false;

  let repliesData = [];
  if (isThreadMode !== false && !isInsideReplies) {
    const thread = commentEl.closest('ytd-comment-thread-renderer');
    const repliesContainer = thread?.querySelector('ytd-comment-replies-renderer');
    if (repliesContainer) {
      const replyElements = Array.from(repliesContainer.querySelectorAll('ytd-comment-view-model, ytd-comment-renderer'));
      const visibleReplies = replyElements.filter(r => {
        if (r.hasAttribute('hidden') || r.classList.contains('sf-hidden') || r.style.display === 'none') return false;
        return r.offsetWidth > 0 || r.offsetHeight > 0 || r.offsetParent !== null;
      });
      repliesData = visibleReplies.map(extractSingleCommentData).filter(Boolean);
    }
  }

  const isThread = isThreadMode !== undefined ? Boolean(isThreadMode && repliesData.length > 0) : (repliesData.length > 0);

  // Determine parent-child relationship for each reply sequentially
  const knownAuthors = [mainCommentData.author];
  const structuredReplies = repliesData.map(r => {
    // Check if the reply mentions another author in the thread
    const mentionMatch = r.text.match(/@[a-zA-Z0-9_.-]+/);
    let parentAuthor = mainCommentData.author;
    if (mentionMatch) {
      const targetMention = mentionMatch[0].toLowerCase();
      const matched = knownAuthors.find(a => a.toLowerCase() === targetMention);
      if (matched) {
        parentAuthor = matched;
      }
    }
    knownAuthors.push(r.author);
    return { ...r, parentAuthor };
  });

  // Theme check
  const isDark = document.documentElement?.hasAttribute('dark') || 
                 document.documentElement?.classList?.contains('dark') || 
                 document.body?.classList?.contains('dark');

  const colors = {
    cardBg: isDark ? '#0f0f0f' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    textPrimary: isDark ? '#f1f1f1' : '#0f0f0f',
    textSecondary: isDark ? '#aaaaaa' : '#606060',
    likeIcon: isDark ? '#aaaaaa' : '#606060',
    avatarBg: isDark ? '#272727' : '#e5e5e5',
    threadLine: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.18)',
    watermark: isDark ? '#555555' : '#aaaaaa'
  };

  // Dimensions & Layout calculation
  const cardWidth = 640;
  const padX = 28;
  const padY = 24;
  const mainAvatarSize = 44;
  const replyAvatarSize = 32;
  const lineHeight = 20;

  // Temporary canvas to measure wrapped text
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = '14px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

  // Measure Main Comment
  const mainTextX = padX + mainAvatarSize + 14;
  const mainContentWidth = cardWidth - padX - mainTextX;
  const mainLines = wrapCanvasText(tempCtx, mainCommentData.text, mainContentWidth);

  // Position Main Comment
  let currentY = padY;
  const mainTopY = currentY;
  const mainAvatarCenter = {
    x: padX + mainAvatarSize / 2,
    y: mainTopY + mainAvatarSize / 2
  };
  const mainAuthorY = mainTopY + 14;
  const mainTextStartY = mainTopY + 34;
  const mainLikesY = mainTextStartY + (mainLines.length * lineHeight) + 12;
  const mainBlockHeight = Math.max(mainAvatarSize + 12, (mainLikesY + 18) - mainTopY) + 16;
  currentY += mainBlockHeight;

  // Measure and Position Replies
  const measuredReplies = structuredReplies.map((r) => {
    const isNested = r.parentAuthor !== mainCommentData.author;
    const indentX = isNested ? padX + 54 : padX + 32;
    const textX = indentX + replyAvatarSize + 12;
    const contentWidth = cardWidth - padX - textX;

    const lines = wrapCanvasText(tempCtx, r.text, contentWidth);
    const topY = currentY;
    const avatarCenter = {
      x: indentX + replyAvatarSize / 2,
      y: topY + replyAvatarSize / 2
    };
    const authorY = topY + 14;
    const textStartY = topY + 32;
    const likesY = textStartY + (lines.length * lineHeight) + 12;
    const blockHeight = Math.max(replyAvatarSize + 12, (likesY + 18) - topY) + 14;

    currentY += blockHeight;

    return {
      ...r,
      isNested,
      indentX,
      textX,
      lines,
      topY,
      avatarCenter,
      authorY,
      textStartY,
      likesY,
      blockHeight
    };
  });

  const watermarkHeight = 24;
  const cardHeight = Math.max(140, currentY + watermarkHeight + padY);

  // High-DPI canvas (Scale 2x)
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = cardWidth * scale;
  canvas.height = cardHeight * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Draw Card Background
  drawRoundedCard(ctx, 0, 0, cardWidth, cardHeight, 16);
  ctx.fillStyle = colors.cardBg;
  ctx.fill();
  ctx.strokeStyle = colors.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Load all avatar images & creator heart images concurrently
  const avatarUrls = [
    mainCommentData.avatarSrc,
    mainCommentData.creatorHeartSrc,
    ...structuredReplies.flatMap(r => [r.avatarSrc, r.creatorHeartSrc])
  ];
  const loadedImages = await Promise.all(avatarUrls.map(loadAvatarImage));

  const mainAvatarImg = loadedImages[0];
  const mainCreatorHeartImg = loadedImages[1];

  const replyAvatarImgs = [];
  const replyCreatorHeartImgs = [];
  for (let i = 2; i < loadedImages.length; i += 2) {
    replyAvatarImgs.push(loadedImages[i]);
    replyCreatorHeartImgs.push(loadedImages[i + 1]);
  }

  // Draw YouTube-Style Curved Threadlines
  if (isThread && measuredReplies.length > 0) {
    ctx.save();
    ctx.strokeStyle = colors.threadLine;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const curveR = 14;

    // 1. Main Spine from Root Comment
    const directReplies = measuredReplies.filter(r => !r.isNested);
    if (directReplies.length > 0) {
      const mainSpineX = mainAvatarCenter.x;
      const startSpineY = mainAvatarCenter.y + mainAvatarSize / 2 + 2;
      const lastDirectReply = directReplies[directReplies.length - 1];

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mainSpineX, startSpineY);
      ctx.lineTo(mainSpineX, lastDirectReply.avatarCenter.y - curveR);
      ctx.stroke();

      // Branch to each direct reply
      directReplies.forEach((r) => {
        ctx.beginPath();
        ctx.moveTo(mainSpineX, r.avatarCenter.y - curveR);
        ctx.quadraticCurveTo(mainSpineX, r.avatarCenter.y, mainSpineX + curveR, r.avatarCenter.y);
        ctx.lineTo(r.indentX - 1, r.avatarCenter.y);
        ctx.stroke();
      });
    }

    // 2. Sub-Spines for Nested Replies
    const nestedParents = new Set(measuredReplies.filter(r => r.isNested).map(r => r.parentAuthor));
    nestedParents.forEach(pAuthor => {
      const parentReply = measuredReplies.find(r => r.author === pAuthor);
      if (!parentReply) return;

      const children = measuredReplies.filter(r => r.parentAuthor === pAuthor);
      if (children.length === 0) return;

      const subSpineX = parentReply.avatarCenter.x;
      const subStartY = parentReply.avatarCenter.y + replyAvatarSize / 2 + 2;
      const lastChild = children[children.length - 1];

      // Vertical sub-spine
      ctx.beginPath();
      ctx.moveTo(subSpineX, subStartY);
      ctx.lineTo(subSpineX, lastChild.avatarCenter.y - curveR);
      ctx.stroke();

      // Branch to each child
      children.forEach((c) => {
        ctx.beginPath();
        ctx.moveTo(subSpineX, c.avatarCenter.y - curveR);
        ctx.quadraticCurveTo(subSpineX, c.avatarCenter.y, subSpineX + curveR, c.avatarCenter.y);
        ctx.lineTo(c.indentX - 1, c.avatarCenter.y);
        ctx.stroke();
      });
    });

    ctx.restore();
  }

  // Draw Main Comment Avatar
  drawAvatarCircle(ctx, padX, mainTopY, mainAvatarSize, mainAvatarImg, mainCommentData.author, colors);

  // Draw Main Comment Author & Timestamp
  ctx.font = 'bold 15px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.textPrimary;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(mainCommentData.author, mainTextX, mainAuthorY);

  if (mainCommentData.time) {
    const authorWidth = ctx.measureText(mainCommentData.author).width;
    ctx.font = '400 12px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = colors.textSecondary;
    ctx.fillText(mainCommentData.time, mainTextX + authorWidth + 8, mainAuthorY);
  }

  // Draw Main Comment Text
  ctx.font = '400 14px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.textPrimary;
  mainLines.forEach((line, idx) => {
    if (line) {
      ctx.fillText(line, mainTextX, mainTextStartY + (idx * lineHeight));
    }
  });

  // Draw Main Comment Toolbar (Like, Count, Dislike, Creator Heart)
  let toolbarX = mainTextX;
  const toolbarY = mainLikesY;

  // 1. Like icon
  drawCommentThumbIcon(ctx, toolbarX, toolbarY - 10, colors.likeIcon, false);
  toolbarX += 16;

  // 2. Like count
  ctx.font = '500 12px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.textSecondary;
  ctx.textBaseline = 'middle';
  const mainLikesText = mainCommentData.likes || '0';
  ctx.fillText(mainLikesText, toolbarX, toolbarY - 2);
  toolbarX += ctx.measureText(mainLikesText).width + 16;

  // 3. Dislike icon
  drawCommentThumbIcon(ctx, toolbarX, toolbarY - 10, colors.likeIcon, true);
  toolbarX += 20;

  // 4. Creator Heart Badge
  if (mainCommentData.hasCreatorHeart) {
    drawCreatorHeartBadge(ctx, toolbarX, toolbarY - 12, mainCreatorHeartImg, colors);
  }

  // Draw Replies
  if (isThread) {
    measuredReplies.forEach((r, idx) => {
      const rAvatarImg = replyAvatarImgs[idx];
      const rCreatorHeartImg = replyCreatorHeartImgs[idx];

      // Reply Avatar
      drawAvatarCircle(ctx, r.indentX, r.topY, replyAvatarSize, rAvatarImg, r.author, colors);

      // Reply Author & Time
      ctx.font = 'bold 14px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.textPrimary;
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(r.author, r.textX, r.authorY);

      if (r.time) {
        const rAuthorWidth = ctx.measureText(r.author).width;
        ctx.font = '400 11px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(r.time, r.textX + rAuthorWidth + 6, r.authorY);
      }

      // Reply Text Lines
      ctx.font = '400 13px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.textPrimary;
      r.lines.forEach((line, lIdx) => {
        if (line) {
          ctx.fillText(line, r.textX, r.textStartY + (lIdx * lineHeight));
        }
      });

      // Reply Toolbar (Like, Count, Dislike, Creator Heart)
      let rToolbarX = r.textX;
      const rToolbarY = r.likesY;

      // Like
      drawCommentThumbIcon(ctx, rToolbarX, rToolbarY - 10, colors.likeIcon, false);
      rToolbarX += 16;

      // Like Count
      ctx.font = '500 11px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.fillStyle = colors.textSecondary;
      ctx.textBaseline = 'middle';
      const rLikesText = r.likes || '0';
      ctx.fillText(rLikesText, rToolbarX, rToolbarY - 2);
      rToolbarX += ctx.measureText(rLikesText).width + 16;

      // Dislike
      drawCommentThumbIcon(ctx, rToolbarX, rToolbarY - 10, colors.likeIcon, true);
      rToolbarX += 20;

      // Creator Heart Badge
      if (r.hasCreatorHeart) {
        drawCreatorHeartBadge(ctx, rToolbarX, rToolbarY - 12, rCreatorHeartImg, colors);
      }
    });
  }

  // Draw Bottom Watermark
  const watermarkY = cardHeight - padY;
  ctx.font = '400 11px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colors.watermark;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(isThread ? `YouTube Control • Thread (${structuredReplies.length} replies)` : 'YouTube Control', cardWidth - padX, watermarkY);
  ctx.textAlign = 'left';

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      // 1. Copy to Clipboard
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        }
      } catch (err) {
        console.warn('Clipboard copy failed:', err);
      }

      // 2. Download PNG file
      try {
        const url = URL.createObjectURL(blob);
        const safeAuthor = mainCommentData.author.replace(/[^a-zA-Z0-9_@.-]/g, '_').substring(0, 30);
        const link = document.createElement('a');
        link.download = isThread ? `youtube_thread_${safeAuthor}.png` : `youtube_comment_${safeAuthor}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          link.remove();
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (err) {
        console.error('Comment PNG download failed:', err);
      }

      // 3. Button Feedback (Checkmark animation)
      if (btnEl) {
        btnEl.classList.add('copied');
        setCommentCheckmarkIcon(btnEl);
        setTimeout(() => {
          btnEl.classList.remove('copied');
          setCommentCameraIcon(btnEl);
        }, 1500);
      }

      resolve(true);
    }, 'image/png');
  });
}
