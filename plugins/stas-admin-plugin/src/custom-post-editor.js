import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	CheckboxControl,
	SnackbarList,
	TextControl,
	MediaUpload,
	__experimentalText as Text
} from "@wordpress/components";
import {__} from "@wordpress/i18n";
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
const CustomPostEditor = ({ onPostCreated, onCancel }) => {
	const [title, setTitle] = useState('');
	const [excerpt, setExcerpt] = useState('');
	const [stas_price_value, setStas_price_value] = useState(0);
	const [stas_sale_price_value, setStas_sale_price_value] = useState(0);
	const [stas_is_onsale_value, setStas_is_onsale_value] = useState(false);
	const [stas_youtube_link_value, setStas_youtube_link_value] = useState('');
	const [featuredImageId, setFeaturedImageId] = useState(null);
	const [featuredImageUrl, setFeaturedImageUrl] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [postId, setPostId] = useState(null);

	const savePost = async () => {
		setIsSaving(true);
		const post = {
			title,
			excerpt,
			stas_price_value: parseInt(stas_price_value),
			stas_sale_price_value: parseInt(stas_sale_price_value),
			stas_is_onsale_value: stas_is_onsale_value,
			stas_youtube_link_value: stas_youtube_link_value,
			featured_media: featuredImageId,
			status: 'publish',
		};

		try {
			const response = await apiFetch({
				path: '/wp/v2/stas_product',
				method: 'POST',
				data: post,
			});

			setPostId(response.id);
			setIsSaved(true);
		} catch (error) {
			console.error('Error creating post:', error);
		} finally {
			setIsSaving(false);
		}
	};

	useEffect(() => {
		if (isSaved && postId) {
			onPostCreated(postId);
		}
	}, [isSaved, postId]);

	return (
		<div>
			<Text><Button variant="secondary" onClick={onCancel}>Back to List</Button></Text>
			<h2>Add New Custom Post</h2>
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
			{/*<div>
				<h3>Featured Image</h3>
				<MediaUpload
					onSelect={(media) => {
						setFeaturedImageId(media.id);
						setFeaturedImageUrl(media.url);
					}}
					allowedTypes={['image']}
					render={({ open }) => (
						<Button onClick={open} isPrimary>
							Upload Featured Image
						</Button>
					)}
				/>
			</div>*/}
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

export default CustomPostEditor;
