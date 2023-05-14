import { registerBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import CustomPostEditor from './custom-post-editor';
import CustomPostUpdate from './custom-post-update';

registerBlockType( 'your-namespace/custom-post-block', {
	title: 'Custom Post Block',
	icon: 'welcome-add-page',
	category: 'widgets',

	edit: ( { attributes, setAttributes } ) => {
		const postId = attributes.postId;
		const post = useSelect(
			( select ) => postId && select( 'core' ).getPost( postId ),
			[ postId ]
		);

		if ( ! postId || ! post ) {
			return <CustomPostEditor onPostCreated={ ( newPostId ) => setAttributes( { postId: newPostId } ) } />;
		}

		return <CustomPostUpdate post={ post } />;
	},

	save: () => {
		// Use dynamic rendering on the server-side
		return null;
	},
} );
