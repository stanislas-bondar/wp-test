import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {__} from "@wordpress/i18n";
import {
	Button,
	SnackbarList,
	TextControl,
	MediaUpload,
	CheckboxControl, __experimentalText as Text,
} from "@wordpress/components";
import {dispatch, useDispatch, useSelect} from "@wordpress/data";
import { store as noticesStore } from '@wordpress/notices';

const Notices = () => {

	const notices = useSelect(
		( select ) =>
			select( noticesStore )
				.getNotices()
				.filter( ( notice ) => notice.type === 'snackbar' ),
		[]
	);
	const { removeNotice } = useDispatch( noticesStore );
	return (
		<SnackbarList
			className="edit-site-notices"
			notices={ notices }
			onRemove={ removeNotice }
		/>
	);
};
const CustomPostUpdate = ({ postId, onBack }) => {
	const [post, setPost] = useState(null);
	const [title, setTitle] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [stas_price_value, setStas_price_value] = useState(0);
	const [stas_sale_price_value, setStas_sale_price_value] = useState(0);
	const [stas_is_onsale_value, setStas_is_onsale_value] = useState(false);
	const [stas_youtube_link_value, setStas_youtube_link_value] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const postData = await apiFetch({
					path: `/wp/v2/stas_product/${postId}?_embed`,
				});
				setPost(postData);
				setTitle(postData.title.rendered);
				setExcerpt(postData.excerpt.rendered);
				setStas_price_value(parseInt(postData.stas_price_value) || 0);
				setStas_sale_price_value(parseInt(postData.stas_sale_price_value) || 0);
				setStas_is_onsale_value(postData.stas_is_onsale_value);
				setStas_youtube_link_value(postData.stas_youtube_link_value);
			} catch (error) {
				console.error('Error fetching post:', error);
			}
		};
		fetchPost();
	}, [postId]);

	const savePost = async () => {
		setIsSaving(true);
		const updatedPost = {
			title,
			excerpt,
			stas_price_value: parseInt(stas_price_value),
			stas_sale_price_value: parseInt(stas_sale_price_value),
			stas_is_onsale_value: stas_is_onsale_value,
			stas_youtube_link_value: stas_youtube_link_value,
		};

		try {
			let res = await apiFetch({
				path: `/wp/v2/stas_product/${postId}`,
				method: 'POST',
				data: updatedPost,
			});
			console.log(updatedPost)
			console.log('Post updated successfully!');
		} catch (error) {
			console.log(updatedPost)
			console.error('Error updating post:', error);
		} finally {
			setIsSaving(false);
		}
	};

	if (!post) {
		return <div>Loading...</div>;
	}

	const DisplayAndReplaceThumbnail = ({ postId }) => {
		const [thumbnailUrl, setThumbnailUrl] = useState('');

		useEffect(() => {
			const fetchPostWithThumbnail = async () => {
				try {
					const post = await apiFetch({
						path: `/wp/v2/stas_product/${postId}?_embed`,
					});

					if (post.featured_media && post._embedded['wp:featuredmedia']) {
						const thumbnail = post._embedded['wp:featuredmedia'][0];
						setThumbnailUrl(thumbnail.source_url);
					}
				} catch (error) {
					console.error('Error fetching post:', error);
				}
			};

			fetchPostWithThumbnail();
		}, [postId]);

		const onUpdateThumbnail = async (thumbnailId) => {
			try {
				const response = await apiFetch({
					path: `/wp/v2/stas_product/${postId}`,
					method: 'POST',
					data: {
						featured_media: thumbnailId,
					},
				});

				console.log('Post thumbnail updated successfully:', response);
			} catch (error) {
				console.error('Error updating post thumbnail:', error);
			}
		};

		const onSelectThumbnail = (media) => {
			setThumbnailUrl(media.url);
			onUpdateThumbnail(media.id);
		};

		return (
			<div>
				{thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail" />}
				<MediaUpload
					onSelect={onSelectThumbnail}
					allowedTypes={['image']}
					value={thumbnailUrl}
					render={({ open }) => (
						<Button onClick={open} isPrimary>
							Replace Thumbnail
						</Button>
					)}
				/>
			</div>
		);
	};


	return (
		<div>
			<Text><Button variant="secondary" onClick={onBack}>Back to List</Button></Text>
			<h2>Edit Custom Post</h2>
			{/*<DisplayAndReplaceThumbnail postId={postData.id} />*/}
			<TextControl
				label={ __( 'Title:', 'wholesome-plugin' ) }
				onChange={(value) => setTitle(value)}
				value={ title }
			/>
			<TextControl
				label={ __( 'Excerpt:', 'wholesome-plugin' ) }
				onChange={(value) => setExcerpt(value)}
				value={ excerpt }
			/>
			<label>
				Price:
				<input type="number"
					value={stas_price_value}
					onChange={(e) => setStas_price_value(parseInt(e.target.value))}
				></input>
			</label>
			<label>
				Sale Price:
				<input type="number"
					   value={stas_sale_price_value}
					   onChange={(e) => setStas_sale_price_value(parseInt(e.target.value))}
				></input>
			</label>
			<CheckboxControl
				label="Is on sale"
				checked={ stas_is_onsale_value }
				onChange={ setStas_is_onsale_value }
			/>
			<TextControl
				label={ __( 'Youtube link:', 'wholesome-plugin' ) }
				onChange={(value) => setStas_youtube_link_value(value)}
				value={ stas_youtube_link_value }
			/>
			<Button
				isPrimary
				isLarge
				onClick={ () => {
					savePost();
					dispatch('core/notices').createNotice(
						'success',
						__( 'Post Saved', 'wholesome-plugin' ),
						{
							type: 'snackbar',
							isDismissible: true,
						}
					);
				}}
			>
				{isSaving ? 'Saving...' : 'Save'}
			</Button>

			<div className="wholesome-plugin__notices">
				<Notices/>
			</div>
		</div>
	);
};

export default CustomPostUpdate;
